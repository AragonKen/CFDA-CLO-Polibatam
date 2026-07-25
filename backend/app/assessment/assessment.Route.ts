import { Router, Request } from "express";
import { AssessmentController } from "./assessment.Controller";
import { AssessmentMiddleware } from "./assessment.Middleware";
import { require_in_unit, require_permission } from "../../shared/middleware.Shared";
import prisma from "../../lib/prisma.service";

async function tbm_course_get_department_id_from_body(req: Request) {
  return await prisma.tbm_course.findFirst({
    select: {
      study_program: {
        select: { department_id: true }
      }
    },
    where: { id: req.body.course_id }
  }).then(data => data!.study_program.department_id);
}

async function tbm_assessment_get_department_id_from_param(req: Request) {
  return await prisma.tbm_assessment.findFirst({
    select: {
      course: {
        select: {
          study_program: {
            select: { department_id: true }
          }
        }
      }
    },
    where: { id: req.params.id }
  }).then(data => data!.course!.study_program.department_id);
}

export const AssessmentRoute = Router()
  // =======================================================================================================================================================
  // Summary
  // =======================================================================================================================================================

  .get(
    "/summary/percentage-student-per-category/:id",
    AssessmentMiddleware.checkId,
    AssessmentController.getPercentagePerCategory
  )
  .get(
    "/summary/proficiency-per-assessment-tool/:id",
    AssessmentMiddleware.checkId,
    AssessmentController.getProficiencyPerAssessmentTool
  )
  .get(
    "/summary/proficiency-student-per-proficiency-level/:id",
    AssessmentMiddleware.checkId,
    AssessmentController.getPercentagePerProficiencyLevel
  )
  .get(
    "/summary/performance-indicator-attainment/:id",
    AssessmentMiddleware.checkId,
    AssessmentController.getPerformanceIndicatorAttainment
  )
  .get(
    "/summary/assessment-results/:id",
    AssessmentMiddleware.checkId,
    AssessmentController.getSummaryAssessmentResults
  )

  // =======================================================================================================================================================
  // Assessment Form
  // =======================================================================================================================================================

  .get(
    "/handsontable/:id",
    AssessmentMiddleware.checkId,
    AssessmentController.getHandsontable
  )

  .get(
    "/form/:id",
    AssessmentMiddleware.checkId,
    AssessmentController.getGeneratedForm
  )
  .post(
    "/form/:id",
    AssessmentMiddleware.checkId,
    AssessmentMiddleware.schemaAssessmentStudent,
    AssessmentController.upsertAssessmentStudent
  )
  .post(
    "/form/bulk/:id",
    AssessmentMiddleware.checkId,
    AssessmentMiddleware.schemaAssessmentStudentBulk,
    AssessmentController.bulkStoreAssessmentStudent
  )
  .post(
    "/form/single/:id",
    AssessmentMiddleware.checkId,
    AssessmentMiddleware.schemaAssessmentStudent,
    AssessmentController.updateSingleAssessmentStudent
  )
  .delete(
    "/form/student/:id",
    AssessmentMiddleware.checkId,
    AssessmentController.deleteAssessmentStudent
  )

  // =======================================================================================================================================================
   // Assessment CRUD
  // =======================================================================================================================================================

  .get("/", AssessmentController.get)
  .get("/:id", AssessmentMiddleware.checkId, AssessmentController.getById)
  .post("/",
    require_permission("create_assessment"),
    AssessmentMiddleware.schema,
    require_in_unit(tbm_course_get_department_id_from_body),
    AssessmentController.create
  )
  .put(
    "/:id",
    require_permission("update_assessment"),
    AssessmentMiddleware.checkId,
    AssessmentMiddleware.schema,
    require_in_unit(tbm_assessment_get_department_id_from_param),
    AssessmentController.update
  )
  .delete(
    "/:id",
    require_permission("delete_assessment"),
    AssessmentMiddleware.checkId,
    require_in_unit(tbm_assessment_get_department_id_from_param),
    AssessmentController.delete
  );
