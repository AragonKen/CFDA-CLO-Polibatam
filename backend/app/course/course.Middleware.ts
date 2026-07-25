import { Request, Response, NextFunction } from "express";
import { ValidationService } from "../../lib/validation.service";
import { CourseSchema } from "./course.Schema";
import { ErrorResponse } from "../../utils/api-response";
import { CourseRepository } from "./course.Repository";

class Middleware {
  async schema(req: Request, res: Response, next: NextFunction) {
    try {
      const validate: CourseSchema = ValidationService.validate(
        CourseSchema,
        req.body
      );

      const weightTotal = validate.assessment_types.reduce(
        (total, assessment) => total + assessment.weight,
        0
      );

      if (weightTotal !== 100) throw new Error("Weight total must be 100");

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

      const course = await CourseRepository.fetchByAny(id);
      if (!course) throw new Error("Course not found");

      req.params.id = course.id;
      next();
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const CourseMiddleware = new Middleware();
