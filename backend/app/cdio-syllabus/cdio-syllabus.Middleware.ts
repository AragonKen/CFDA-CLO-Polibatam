import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../../utils/api-response";
import { ValidationService } from "../../lib/validation.service";
import {
  CDIOSyllabusBulkSchema,
  CDIOSyllabusParentSchema,
  CDIOSyllabusSchema,
} from "./cdio-syllabus.Schema";

class Middleware {
  async schemaParent(req: Request, res: Response, next: NextFunction) {
    try {
      const validate = ValidationService.validate(
        CDIOSyllabusParentSchema,
        req.body
      );

      req.body = validate;
      next();
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async schema(req: Request, res: Response, next: NextFunction) {
    try {
      const validate = ValidationService.validate(CDIOSyllabusSchema, req.body);

      req.body = validate;
      next();
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  static transformBulkData(data: { description: string | null }[]) {
    const categories: {
      code: number;
      description: string;
      children: { code: number; description: string }[];
    }[] = [];
    let currentCategory: {
      code: number;
      description: string;
      children: { code: number; description: string }[];
    } | null = null;

    data.forEach(({ description }) => {
      if (!description || description.trim() === "") return; // Ignore null or empty descriptions

      const match = description.match(/^(\d+)(\.\d+)?/);
      const code = match ? parseInt(match[1], 10) : 0;
      const childCode = match && match[2] ? parseFloat(match[0]) : code;
      const isParent = /^\d+\s/.test(description);
      const cleanDescription = description.replace(/^\d+(\.\d+)?\s*/, "");

      if (isParent) {
        currentCategory = { code, description: cleanDescription, children: [] };
        categories.push(currentCategory);
      } else if (currentCategory) {
        currentCategory.children.push({
          code: childCode,
          description: cleanDescription,
        });
      }
    });

    return categories;
  }

  async bulkSchema(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;

      const validate: CDIOSyllabusBulkSchema = ValidationService.validate(
        CDIOSyllabusBulkSchema,
        {
          ...body,
          data: Middleware.transformBulkData(body.data),
        }
      );

      req.body = validate;
      next();
    } catch (error) {
      console.log(error);

      return ErrorResponse({ req, res, error });
    }
  }
}

export const CDIOSyllabusMiddleware = new Middleware();
