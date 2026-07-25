import { Router } from "express";
import { DepartmentController } from "./department.Controller";
import { DepartmentMiddleware } from "./department.Middleware";
import { require_permission } from "../../shared/middleware.Shared";

export const DepartmentRoute = Router()
  .get("/", DepartmentController.get)
  .post("/",
    require_permission("create_department"),
    DepartmentMiddleware.schema,
    DepartmentController.store
  )
  .get(
    "/:id",
    DepartmentMiddleware.checkId,
    DepartmentController.getByID
  )
  .put(
    "/:id",
    require_permission("update_department"),
    DepartmentMiddleware.checkId,
    DepartmentMiddleware.schema,
    DepartmentController.update
  )
  .delete(
    "/:id",
    require_permission("delete_department"),
    DepartmentMiddleware.checkId,
    DepartmentController.delete
  );
