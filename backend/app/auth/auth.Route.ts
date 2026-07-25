import { Router } from "express";
import { AuthToken } from "../../shared/middleware.Shared";

import { AuthMiddleware } from "./auth.Middleware";
import { AuthController } from "./auth.Controller";

export const AuthRoute = Router()
  .get(
    "/me",
    AuthToken,
    AuthController.me
  )
  .get(
    "/role-and-permissions",
    AuthToken,
    AuthController.role_and_permissions
  )
  .post(
    "/login",
    AuthMiddleware.schemaLogin,
    AuthController.login,
  );
