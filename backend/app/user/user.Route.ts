import { Router } from "express";

import { UserController } from "./user.Controller";
import { require_permission } from "../../shared/middleware.Shared";

export const UserRoute = Router()
  .post("/generate",
    require_permission("create_user"),
    UserController.GenerateUser
  )

  .put(
    "/:id/role",
    require_permission("modify_user_role"),
    UserController.SetUserRole
  )
  .put(
    "/:id/department",
    require_permission("modify_user_department"),
    UserController.SetUserDepartment
  )
  .get("/", UserController.GetUser)
  .get("/:id", UserController.GetUserByNIP);
