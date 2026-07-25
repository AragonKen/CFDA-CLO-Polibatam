import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../../utils/api-response";
import { ValidationService } from "../../lib/validation.service";
import { DepartmentSchema } from "./department.Schema";
import { JurusanRepository } from "./department.Repository";

class Middleware {
  async schema(req: Request, res: Response, next: NextFunction) {
    try {
      const validate = ValidationService.validate(DepartmentSchema, req.body);

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

      const check = await JurusanRepository.fetchByIDOrCode(id);
      if (!check) throw new Error("Data not found");

      req.params.id = check.id;
      next();
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const DepartmentMiddleware = new Middleware();
