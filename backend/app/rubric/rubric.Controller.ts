import { Request, Response } from "express";
import { ErrorResponse, Ok } from "../../utils/api-response";
import { RubricRepository } from "./rubric.Repository";

class Controller {
  async get(req: Request, res: Response) {
    try {
      const { search, study_program_id, course_id, page, page_size } =
        req.query;

      const data = await RubricRepository.fetch({
        search: search ? String(search) : undefined,

        page: page ? Number(page) : 1,
        page_size: page_size ? Number(page_size) : 10,

        study_program_id: study_program_id
          ? String(study_program_id)
          : undefined,
        course_id: course_id ? String(course_id) : undefined,
      });

      return Ok({ res, data: data.data, pagination: data.pagination });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data = await RubricRepository.fetchById(String(id));

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = await RubricRepository.create({
        data: req.body,
      });

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async bulkCreate(req: Request, res: Response) {
    try {
      const data = await RubricRepository.bulkCreate({
        data: req.body,
      });

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const data = await RubricRepository.update({
        id: req.params.id,
        data: req.body,
      });

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const data = await RubricRepository.delete(req.params.id);

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const RubricController = new Controller();
