import express, { Application, Response, Request, NextFunction } from "express";
import cors from "cors";
import logger from "morgan";
import cookieParser from "cookie-parser";
import routes from "../routes";
import prisma from "./prisma.service";
import path from "path";
import session from "express-session";

import { InternalServerError } from "../utils/api-response";
import { redisClient } from "./redis.service";
import { ErrorHandler } from "../shared/middleware.Shared";

// import { ErrorHandler } from "../middlewares/error-handler";

class App {
  public express: Application;

  constructor() {
    this.express = express();

    this.middlewares();
    this.disableSettings();
    this.routes();
    this.errorHandler();

    this.connectPrisma().catch((e) => {
      throw e;
    });

    this.connectRedis().catch((e) => {
      throw e;
    });
  }

  private middlewares(): void {
    this.express
      .use(cors())
      .use(logger("dev"))
      .use(express.json())
      .use(express.urlencoded({ extended: false }))
      .use(cookieParser())
      .use(express.static("public"))
      .use(
        session({
          secret: "something crazy",
          resave: false,
          saveUninitialized: true,
          cookie: { secure: false },
        })
      );
  }

  private disableSettings(): void {
    this.express.disable("x-powered-by");
  }

  private routes(): void {
    const apiVersion = process.env.API_VERSION || "v1";
    const preRoute = `/${apiVersion}`;

    this.express.use(`${preRoute}/`, routes);

    this.express.get("/", (req: Request, res: Response) => {
      try {
        res.sendFile(path.join(__dirname, "../public/home.html"));
      } catch (err) {
        return InternalServerError({ res, data: err });
      }
    });
  }

  private errorHandler(): void {
    this.express.use(ErrorHandler);
  }

  // ===============================================================================
  // PRISMA
  // ===============================================================================

  public async connectPrisma(): Promise<void> {
    await prisma.$connect();
  }

  public async disconnectPrisma(): Promise<void> {
    await prisma.$disconnect();
  }

  // ===============================================================================
  // REDIS
  // ===============================================================================

  public async connectRedis(): Promise<void> {
    await redisClient.connect();
  }

  public async disconnectRedis(): Promise<void> {
    await redisClient.disconnect();
  }
}

export default App;
