import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../../utils/api-response";
import {
  AssessmentGradeBulkSchema,
  AssessmentGradeSchema,
  AssessmentSchema,
} from "./assessment.Schema";
import { AssessmentRepository } from "./assessment.Repository";

class Middleware {
  async schema(req: Request, res: Response, next: NextFunction) {
    try {
      const validate = AssessmentSchema.parse(req.body);

      req.body = validate;
      next();
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async schemaAssessmentStudent(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const validate = AssessmentGradeSchema.parse(req.body);

      req.body = validate;
      next();
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async schemaAssessmentStudentBulk(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const validate = AssessmentGradeBulkSchema.parse(req.body);

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

      const check = await AssessmentRepository.fetchById(id);
      if (!check) throw new Error("Assessment not found");

      req.params.id = id;
      next();
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const AssessmentMiddleware = new Middleware();
