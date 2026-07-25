import { Request, Response } from "express";
import { ErrorResponse, Ok } from "../../utils/api-response";
import { CourseRepository } from "./course.Repository";

import { get_user_department } from "../../utils/helper";

class Controller {
  async get(req: Request, res: Response) {
    try {
      const { page, page_size, search, study_program_id, in_user_department } = req.query;
      const user_department_id = get_user_department(req.user);

      const data = await CourseRepository.fetch({
        page: page ? Number(page) : 1,
        page_size: page_size ? Number(page_size) : 10,

        search: search ? String(search) : undefined,

        study_program_id: study_program_id
          ? String(study_program_id)
          : undefined,

        user_department_id: in_user_department !== "false" ? (user_department_id ?? undefined) : undefined
      });

      return Ok({ res, data: data.data, pagination: data.pagination });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data = await CourseRepository.fetchById(id);

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = await CourseRepository.store({
        data: req.body,
        creator: req.cookies.user,
      });

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data = await CourseRepository.update({
        id,
        data: req.body,
        modifier: req.cookies.user,
      });

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data = await CourseRepository.delete({
        id,
        modifier: req.cookies.user,
      });

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  // ==============================================================================================
  // Course Assessment Plan
  // ==============================================================================================

  async getCoursePerformanceIndicatorByCourseId(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data =
        await CourseRepository.fetchCoursePerformanceIndicatorByCourseId({
          course_id: id,
        });

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const CourseController = new Controller();
