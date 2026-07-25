import { NextFunction, Request, Response } from "express";
import { ValidationService } from "../../lib/validation.service";
import { ErrorResponse } from "../../utils/api-response";
import { ProficiencyLevelDetailSchema } from "./proficiency-level.Schema";

class Middleware {
  async schemaDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const validate = ValidationService.validate(
        ProficiencyLevelDetailSchema,
        req.body
      );

      req.body = validate;
      return next();
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const ProficiencyLevelMiddleware = new Middleware();
