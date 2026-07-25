import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../../utils/api-response";
import { ValidationService } from "../../lib/validation.service";
import { AssessmentMethodSchema } from "./assessment-method.Schema";
import { AssessmentMethodRepository } from "./assessment-method.Repository";

class Middleware {
  async schema(req: Request, res: Response, next: NextFunction) {
    try {
      const validate = ValidationService.validate(
        AssessmentMethodSchema,
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
      if (!id) throw new Error("ID is required");

      const check = await AssessmentMethodRepository.fetchByID(String(id));
      if (!check) throw new Error("Data not found");

      next();
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const AssessmentMethodMiddleware = new Middleware();
