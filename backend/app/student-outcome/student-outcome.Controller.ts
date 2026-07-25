import { Request, Response } from "express";
import { ErrorResponse, Ok } from "../../utils/api-response";
import { StudentOutcomeRepository } from "./student-outcome.Repository";

class Controller {
  async get(req: Request, res: Response) {
    try {
      const { search, page, page_size } = req.query;
      const { study_program_id } = req.query;

      const data = await StudentOutcomeRepository.fetch({
        search: search ? String(search) : undefined,

        page: page ? Number(page) : 1,
        page_size: page_size ? Number(page_size) : 10,

        study_program_id: study_program_id
          ? String(study_program_id)
          : undefined,
      });

      return Ok({ res, data: data.data, pagination: data.pagination });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const id = req.params.id;

      const data = await StudentOutcomeRepository.findByID(id);

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = req.body;

      const created = await StudentOutcomeRepository.create({ data });

      return Ok({ res, data: created });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async bulkCreate(req: Request, res: Response) {
    try {
      const created = await StudentOutcomeRepository.bulkCreate(req.body);

      return Ok({ res, data: created });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const data = req.body;

      const updated = await StudentOutcomeRepository.update({ id, data });

      return Ok({ res, data: updated });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id;

      await StudentOutcomeRepository.delete(id);

      return Ok({ res });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const StudentOutcomeController = new Controller();
