import { Request, Response } from "express";
import { ErrorResponse, Ok } from "../../utils/api-response";
import { GradingRepository } from "./grading.Repository";

class Controller {
  async get(req: Request, res: Response) {
    try {
      const { search, page, page_size } = req.query;

      const data = await GradingRepository.fetch({
        search: search ? String(search) : undefined,

        page: page ? Number(page) : 1,
        page_size: page_size ? Number(page_size) : 10,
      });

      return Ok({ res, data: data.data, pagination: data.pagination });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const GradingController = new Controller();
