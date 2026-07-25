import { Router } from "express";
import { CourseLearningOutcomeController } from "./course-learning-outcome.Controller";
import { CourseLearningOutcomeMiddleware } from "./course-learning-outcome.Middleware";

import { require_permission } from "../../shared/middleware.Shared";

export const CourseLearningOutcomeRoute = Router()
  .get("/", CourseLearningOutcomeController.get)
  .get(
    "/:id",
    CourseLearningOutcomeMiddleware.checkId,
    CourseLearningOutcomeController.getById
  )
  .post(
    "/",
    require_permission("create_course_learning_outcome"),
    CourseLearningOutcomeMiddleware.schema,
    CourseLearningOutcomeController.create
  )
  .put(
    "/:id",
    require_permission("update_course_learning_outcome"),
    CourseLearningOutcomeMiddleware.checkId,
    CourseLearningOutcomeMiddleware.schema,
    CourseLearningOutcomeController.update
  )
  .delete(
    "/:id",
    require_permission("delete_course_learning_outcome"),
    CourseLearningOutcomeMiddleware.checkId,
    CourseLearningOutcomeController.delete
  );
