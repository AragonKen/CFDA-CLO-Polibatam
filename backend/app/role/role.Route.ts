import { Router } from "express";
import { RoleController } from "./role.Controller";

export const RoleRoute = Router()
  .get("/", RoleController.get);
