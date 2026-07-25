import { Router } from "express";
import { AssessmentMethodMiddleware } from "./assessment-method.Middleware";
import { AssessmentMethodController } from "./assessment-method.Controller";

export const AssessmentMethodRoute = Router()
  .get("/", AssessmentMethodController.get)
  .get("/:id", AssessmentMethodController.getByID)
  .post(
    "/",
    AssessmentMethodMiddleware.schema,
    AssessmentMethodController.store
  )
  .put(
    "/:id",
    AssessmentMethodMiddleware.schema,
    AssessmentMethodMiddleware.checkId,
    AssessmentMethodController.update
  )
  .delete(
    "/:id",
    AssessmentMethodMiddleware.checkId,
    AssessmentMethodController.delete
  );
