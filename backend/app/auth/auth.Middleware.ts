import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../../utils/api-response";
import { ValidationService } from "../../lib/validation.service";
import { LoginSchema } from "./auth.Schema";

class Middleware {
  async schemaLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const validate = ValidationService.validate(LoginSchema, req.body);

      req.body = validate;
      next();
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const AuthMiddleware = new Middleware();
