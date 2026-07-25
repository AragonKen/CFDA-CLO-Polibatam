import { Router } from "express";
import { CourseAssessmentPlanController } from "./course-assessment-plan.Controller";
import { CourseAssessmentPlanMiddleware } from "./course-assessment-plan.Middleware";

import { require_permission } from "../../shared/middleware.Shared";

export const CourseAssessmentPlanRoute = Router()
  .get("/", CourseAssessmentPlanController.get)
  .get("/:id", CourseAssessmentPlanController.getById)
  .post(
    "/generate/:course_id",
    require_permission("create_course_assessment_plan"),
    CourseAssessmentPlanController.generate
  )
  .put(
    "/:id",
    require_permission("update_course_assessment_plan"),
    CourseAssessmentPlanMiddleware.checkId,
    CourseAssessmentPlanMiddleware.schema,
    CourseAssessmentPlanController.update
  );
