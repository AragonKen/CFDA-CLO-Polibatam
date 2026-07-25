import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../../utils/api-response";
import { ValidationService } from "../../lib/validation.service";
import {
  StudentOutcomeBulkSchema,
  StudentOutcomeSchema,
} from "./student-outcome.Schema";

class Middleware {
  async schema(req: Request, res: Response, next: NextFunction) {
    try {
      const validate = ValidationService.validate(
        StudentOutcomeSchema,
        req.body
      );

      req.body = validate;
      return next();
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async bulkSchema(req: Request, res: Response, next: NextFunction) {
    try {
      const validate = ValidationService.validate(
        StudentOutcomeBulkSchema,
        req.body
      );

      req.body = validate;
      return next();
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const StudentOutcomeMiddleware = new Middleware();
