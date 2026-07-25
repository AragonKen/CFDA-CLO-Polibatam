import { Request, Response, NextFunction } from "express";
import { ValidationService } from "../../lib/validation.service";
import { CourseLearningOutcomeSchema } from "./course-learning-outcome.Schema";
import { ErrorResponse } from "../../utils/api-response";
import { CourseLearningOutcomeRepository } from "./course-learning-outcome.Repository";

class Middleware {
  async schema(req: Request, res: Response, next: NextFunction) {
    try {
      const validate = ValidationService.validate(
        CourseLearningOutcomeSchema,
        req.body
      );

      req.body = validate;
      next();
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async checkId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new Error("Id is required");

      const clo = await CourseLearningOutcomeRepository.fetchByAny(id);
      if (!clo) throw new Error("Course learning outcome not found");

      req.params.id = clo.id;
      next();
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const CourseLearningOutcomeMiddleware = new Middleware();
