import { Request, Response } from "express";
import { ErrorResponse, Ok } from "../../utils/api-response";
import { JurusanRepository } from "./department.Repository";

class Controller {
  async get(req: Request, res: Response) {
    try {
      const { search, page, page_size } = req.query;

      const data = await JurusanRepository.fetch({
        search: search ? String(search) : undefined,

        page: page ? Number(page) : 1,
        page_size: page_size ? Number(page_size) : 10,
      });

      return Ok({ res, data: data.data, pagination: data.pagination });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async getByID(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data = await JurusanRepository.fetchByID(id);

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async store(req: Request, res: Response) {
    try {
      const data = await JurusanRepository.store({ data: req.body });

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data = await JurusanRepository.update({
        id,
        data: req.body,
      });

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data = await JurusanRepository.delete({ id });

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const DepartmentController = new Controller();
