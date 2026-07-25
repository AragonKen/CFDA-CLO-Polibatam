import { Router, Request } from "express";

import { StudentOutcomeController } from "./student-outcome.Controller";
import { StudentOutcomeMiddleware } from "./student-outcome.Middleware";

import { require_permission, require_in_unit } from "../../shared/middleware.Shared";

import prisma from "../../lib/prisma.service";

async function tbm_study_program_get_department_id(req: Request): Promise<string> {
  return await prisma.tbm_study_program.findFirst({ select: { department_id: true }, where: { id: req.body.study_program_id }})
    .then(data => data!.department_id);
}

async function tbm_student_outcome_get_department_id(req: Request): Promise<string> {
  return await prisma.tbm_student_outcome.findFirst({
    select: {
      study_program: {
        select: { department_id: true }
      }
    },
    where: {
      id: req.params.id
    }
  }).then(data => data!.study_program!.department_id);
}

export const StudentOutcomeRoute = Router()
  .get("/", StudentOutcomeController.get)
  .get("/:id", StudentOutcomeController.getOne)
  .post(
    "/bulk",
    require_permission("create_student_outcome"),
    StudentOutcomeMiddleware.bulkSchema,
    require_in_unit(tbm_study_program_get_department_id),
    StudentOutcomeController.bulkCreate
  )
  .post(
    "/",
    require_permission("create_student_outcome"),
    StudentOutcomeMiddleware.schema,
    require_in_unit(tbm_study_program_get_department_id),
    StudentOutcomeController.create
  )
  .put("/:id",
    require_permission("update_student_outcome"),
    StudentOutcomeMiddleware.schema,
    require_in_unit(tbm_student_outcome_get_department_id),
    StudentOutcomeController.update
  )
  .delete(
    "/:id",
    require_permission("delete_student_outcome"),
    require_in_unit(tbm_student_outcome_get_department_id),
    StudentOutcomeController.delete
  );
