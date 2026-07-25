import { Request, Response } from "express";
import { ErrorResponse, Ok } from "../../utils/api-response";
import { CourseLearningOutcomeRepository } from "./course-learning-outcome.Repository";

class Controller {
  async get(req: Request, res: Response) {
    try {
      const { page, page_size, search, course_id } = req.query;

      const data = await CourseLearningOutcomeRepository.fetch({
        page: page ? Number(page) : 1,
        page_size: page_size ? Number(page_size) : 10,

        search: search ? String(search) : undefined,
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

      const data = await CourseLearningOutcomeRepository.fetchById(id);

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const result = await CourseLearningOutcomeRepository.store({
        data: req.body,
        creator: req.cookies.user,
      });

      return Ok({ res, data: result });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await CourseLearningOutcomeRepository.update({
        id,
        data: req.body,
        creator: req.cookies.user,
      });

      return Ok({ res, data: result });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await CourseLearningOutcomeRepository.delete({
        id,
        modifier: req.cookies.user,
      });

      return Ok({ res });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const CourseLearningOutcomeController = new Controller();
