import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../../utils/api-response";
import { CourseAssessmentPlanSchema } from "./course-assessment-plan.Schema";
import { CourseAssessmentPlanRepository } from "./course-assessment-plan.Repository";

class Middleware {
  async schema(req: Request, res: Response, next: NextFunction) {
    try {
      const validate = CourseAssessmentPlanSchema.parse(req.body);

      req.body = validate;
      next();
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async checkId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new Error("ID is required");

      const check = await CourseAssessmentPlanRepository.fetchById({ id });
      if (!check) throw new Error("Course assessment plan not found");

      next();
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const CourseAssessmentPlanMiddleware = new Middleware();
