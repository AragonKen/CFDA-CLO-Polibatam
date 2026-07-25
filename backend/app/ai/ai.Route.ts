import { Router } from "express";
import { AiMiddleware } from "./ai.Middleware";

export const AiRoute = Router().post(
  "/generate",
  AiMiddleware.upload,
  AiMiddleware.convertExcelToJson
);
