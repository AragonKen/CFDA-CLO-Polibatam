import { Request, Response, NextFunction } from "express";
import { ValidationService } from "../../lib/validation.service";
import { ErrorResponse } from "../../utils/api-response";
import { StudyProgramSchema } from "./study-program.Schema";
import { ProgramStudiRepository } from "./study-program.Repository";

class Middleware {
  async schema(req: Request, res: Response, next: NextFunction) {
    try {
      const validate = ValidationService.validate(StudyProgramSchema, req.body);

      req.body = validate;
      next();
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async checkId(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) throw new Error("ID is required");

      const check = await ProgramStudiRepository.fetchByIDOrCode(req.params.id);
      if (!check) throw new Error("Data not found");

      req.params.id = check.id;
      next();
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const StudyProgramMiddleware = new Middleware();
