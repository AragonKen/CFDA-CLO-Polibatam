import { Request, Response } from "express";
import { ErrorResponse, Ok } from "../../utils/api-response";
import { AssessmentMethodRepository } from "./assessment-method.Repository";

class Controller {
  async get(req: Request, res: Response) {
    try {
      const { search, page, page_size } = req.query;

      const data = await AssessmentMethodRepository.fetch({
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

      const data = await AssessmentMethodRepository.fetchByID(String(id));

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async store(req: Request, res: Response) {
    try {
      const data = await AssessmentMethodRepository.store({ data: req.body });

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data = await AssessmentMethodRepository.update({
        id: String(id),
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

      await AssessmentMethodRepository.delete(String(id));

      return Ok({ res });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const AssessmentMethodController = new Controller();
