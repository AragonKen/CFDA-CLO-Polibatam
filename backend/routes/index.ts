import { AuthToken } from "../shared/middleware.Shared";

import { Router, Request, Response } from "express";
import { Ok } from "../utils/api-response";

import ProtectedRoutes from "./protected";
import { AuthRoute } from "../app/auth/auth.Route";

import WebhookRoutes from "./webhook";

const routes = Router();

// CHECK CONNECTION
routes.get("/", (req: Request, res: Response) => {
  return Ok({ res, message: "Connected to API" });
});

// AUTH ROUTES
routes.use("/", AuthRoute);
routes.use("/webhook", WebhookRoutes);

routes.use("/", AuthToken, ProtectedRoutes);

// WHOAMI
routes.get("/whoami", AuthToken, (req: Request, res: Response) => {
  return Ok({ res, data: req.cookies.user });
});

export default routes;
