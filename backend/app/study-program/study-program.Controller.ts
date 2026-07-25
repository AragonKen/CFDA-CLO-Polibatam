import { Request, Response } from "express";
import { BadRequest, ErrorResponse, InternalServerError, Ok } from "../../utils/api-response";
import { ProgramStudiRepository } from "./study-program.Repository";
import { PloAttainmentQuerySchema } from "./study-program.Schema";
import { ZodError } from "zod"
import AttainmentService from "../attainment/attainment.Service";

import { get_user_department } from "../../utils/helper";

class Controller {
  async get(req: Request, res: Response) {
    try {
      const { search, page, page_size, in_user_department } = req.query;
      const { department_id, read_for_course } = req.query;

      const user_department_id = get_user_department(req.user);

      const data = await ProgramStudiRepository.fetch({
        search: search ? String(search) : undefined,

        page: page ? Number(page) : 1,
        page_size: page_size ? Number(page_size) : 10,

        read_for_course: read_for_course === "true",
        department_id: department_id ? String(department_id) : undefined,

        user_department_id: in_user_department !== "false" ? (user_department_id ?? undefined) : undefined
      });

      return Ok({ res, data: data.data, pagination: data.pagination });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await ProgramStudiRepository.fetchByID(id);

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async store(req: Request, res: Response) {
    try {
      const data = await ProgramStudiRepository.store({ data: req.body });

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await ProgramStudiRepository.update({
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

      await ProgramStudiRepository.delete(id);

      return Ok({ res });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async plo_attainment(req: Request, res: Response) {
    try {
      const { academic_year, semester_type } = PloAttainmentQuerySchema.parse({
        ...req.query,
        academic_year: Number(req.query.academic_year)
      });

      const data = await AttainmentService.calculate_plo_attainment(req.params.id, academic_year, semester_type);

      return Ok({ res, data });
    } catch (error) {
      if (error instanceof ZodError) {
        return BadRequest({
          res,
          message: "Validation Error",
          data: error.issues.map((issue) => ({
            [issue.path[0]]: issue.message
          })),
        });
      }

      return InternalServerError({ res, message: "Something went wrong" });
    }
  }
}

export const StudyProgramController = new Controller();
