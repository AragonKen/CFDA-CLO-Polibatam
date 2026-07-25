import { Request, Response } from "express";
import { ErrorResponse, Ok } from "../../utils/api-response";
import { AssessmentMethodRepository } from "./proficiency-level.Repository";

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

      const data = await AssessmentMethodRepository.fetchByID(id);

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async getProficiencyLevelDetailByID(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data =
        await AssessmentMethodRepository.fetchProficiencyLevelDetailByID(id);

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async updateProficiencyLevelDetailByID(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const updatedData =
        await AssessmentMethodRepository.updateProficiencyLevelDetailByID({
          id,
          data,
        });

      return Ok({ res, data: updatedData });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const AssessmentMethodController = new Controller();
