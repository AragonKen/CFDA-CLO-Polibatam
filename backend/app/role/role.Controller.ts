import { Request, Response } from "express";
import { ErrorResponse, Ok } from "../../utils/api-response";
import { RoleRepository } from "./role.Repository";

class Controller {
  async get(req: Request, res: Response) {
    try {
      const data = await RoleRepository.fetch();

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const RoleController = new Controller();
