import { Request, Response } from "express";
import { CourseAssessmentPlanRepository } from "./course-assessment-plan.Repository";
import { ErrorResponse, Ok } from "../../utils/api-response";

class Controller {
  async get(req: Request, res: Response) {
    try {
      const { course_id } = req.query;

      if (!course_id) throw new Error("Course ID is required");

      const data = await CourseAssessmentPlanRepository.fetch({
        course_id: String(course_id),
      });

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data = await CourseAssessmentPlanRepository.fetchById({ id });

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async generate(req: Request, res: Response) {
    try {
      const { course_id } = req.params;

      await CourseAssessmentPlanRepository.generate({
        course_id,
        creator: req.cookies.user,
      });

      return Ok({ res });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const updated = await CourseAssessmentPlanRepository.update({
        id,
        modifier: req.cookies.user,
        data: req.body,
      });

      return Ok({ res, data: updated });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const CourseAssessmentPlanController = new Controller();
