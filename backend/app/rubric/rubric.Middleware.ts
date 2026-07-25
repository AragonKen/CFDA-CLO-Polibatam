import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../../utils/api-response";
import { ValidationService } from "../../lib/validation.service";
import { RubricBulkCreateSchema, RubricSchema } from "./rubric.Schema";

class Middleware {
  async schema(req: Request, res: Response, next: NextFunction) {
    try {
      const validate = ValidationService.validate(RubricSchema, req.body);

      req.body = validate;
      return next();
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async schemaBulkCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const validate = ValidationService.validate(
        RubricBulkCreateSchema,
        req.body
      );

      req.body = validate;
      return next();
    } catch (error) {
      console.log("error", error);

      return ErrorResponse({ req, res, error });
    }
  }
}

export const RubricMiddleware = new Middleware();
