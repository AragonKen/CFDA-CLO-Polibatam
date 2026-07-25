import { Request, Response } from "express";
import { ErrorResponse, Ok } from "../../utils/api-response";
import { AssessmentRepository } from "./assessment.Repository";
import { get_user_department } from "../../utils/helper";

class Controller {
  async get(req: Request, res: Response) {
    try {
      const { page, page_size, search, in_user_department } = req.query;
      const user_department_id = get_user_department(req.user);

      const data = await AssessmentRepository.fetch({
        page: page ? Number(page) : 1,
        page_size: page_size ? Number(page_size) : 10,

        search: search ? String(search) : undefined,

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

      const data = await AssessmentRepository.fetchById(id);

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const result = await AssessmentRepository.store({
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

      const result = await AssessmentRepository.update({
        id,
        data: req.body,
        modifier: req.cookies.user,
      });

      return Ok({ res, data: result });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await AssessmentRepository.delete({
        id,
        modifier: req.cookies.user,
      });

      return Ok({ res, data: result });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async getHandsontable(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data = await AssessmentRepository.fetchHandsontable({
        assessment_id: id,
      });

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async getGeneratedForm(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data = await AssessmentRepository.fetchGeneratedForm({
        assessment_id: id,
      });

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async upsertAssessmentStudent(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await AssessmentRepository.upsertAssessmentStudent({
        assessment_id: id,
        data: req.body,
        creator: req.cookies.user,
      });

      return Ok({ res, data: result });
    } catch (error) {
      console.log(error);

      return ErrorResponse({ req, res, error });
    }
  }

  async bulkStoreAssessmentStudent(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await AssessmentRepository.bulkStoreAssessmentStudent({
        assessment_id: id,
        data: req.body,
        creator: req.cookies.user,
      });

      return Ok({ res, data: result });
    } catch (error) {
      console.log(error);

      return ErrorResponse({ req, res, error });
    }
  }

  async updateSingleAssessmentStudent(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await AssessmentRepository.updateSingleAssessmentStudent({
        assessment_id: id,
        data: req.body,
        creator: req.cookies.user,
      });

      return Ok({
        res,
        data: result,
        message: "Student data updated successfully",
      });
    } catch (error) {
      console.log(error);

      return ErrorResponse({ req, res, error });
    }
  }

  async deleteAssessmentStudent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nim } = req.body;

      const result = await AssessmentRepository.deleteAssessmentStudent({
        assessment_id: id,
        nim,
        modifier: req.cookies.user,
      });

      return Ok({ res, data: result, message: "Student deleted successfully" });
    } catch (error) {
      console.log(error);

      return ErrorResponse({ req, res, error });
    }
  }

  // =======================================================================================================================================================
  // Step 5. Percentage of Students within Each Category
  // =======================================================================================================================================================

  async getPercentagePerCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data = await AssessmentRepository.fetchPercentagePerCategory(id);

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  // =======================================================================================================================================================
  // Step 6. Student Proficiency Level Attainment for Each Assessment Tool
  // =======================================================================================================================================================

  async getProficiencyPerAssessmentTool(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data = await AssessmentRepository.fetchProficiencyPerAssessmentTool(
        id
      );

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  // =======================================================================================================================================================
  // Step 7. Percentage of Students within Each Proficiency Level
  // =======================================================================================================================================================

  async getPercentagePerProficiencyLevel(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data =
        await AssessmentRepository.fetchPercentagePerProficiencyLevel(id);

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  // =======================================================================================================================================================
  // Step 8. Attainment of Each Performance Indicator based on Step 2 & Step 7
  // =======================================================================================================================================================

  async getPerformanceIndicatorAttainment(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data =
        await AssessmentRepository.fetchPerformanceIndicatorAttainment(id);

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  // =======================================================================================================================================================
  // Step 9. Summary of Course Assessment Results
  // =======================================================================================================================================================

  async getSummaryAssessmentResults(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data = await AssessmentRepository.fetchSummaryAssessmentResults(id);

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const AssessmentController = new Controller();
