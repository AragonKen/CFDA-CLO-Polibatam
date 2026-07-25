import { Router, Request } from "express";

import { RubricController } from "./rubric.Controller";
import { RubricMiddleware } from "./rubric.Middleware";

import { require_permission, require_in_unit } from "../../shared/middleware.Shared";
import prisma from "../../lib/prisma.service";

async function tbm_study_program_get_department_id(req: Request): Promise<string> {
  const study_program_id = Array.isArray(req.body) ? req.body[0]?.study_program_id : req.body.study_program_id;
  return await prisma.tbm_study_program.findFirst({
    select: { department_id: true },
    where: { id: study_program_id }
  }).then(data => data!.department_id);
}

async function tbm_rubric_get_department_id(req: Request): Promise<string> {
  return await prisma.tbm_rubric.findFirst({
    select: {
      study_program: {
        select: { department_id: true }
      }
    },
    where: { id: req.params.id }
  }).then(data => data!.study_program.department_id);
}

export const RubricRoute = Router()
  .get("/", RubricController.get)
  .get("/:id", RubricController.getById)
  .post(
    "/",
    require_permission("create_rubric"),
    RubricMiddleware.schema,
    require_in_unit(tbm_study_program_get_department_id),
    RubricController.create
  )
  .post(
    "/bulk",
    require_permission("create_rubric"),
    RubricMiddleware.schemaBulkCreate,
    require_in_unit(tbm_study_program_get_department_id),
    RubricController.bulkCreate
  )
  .put(
    "/:id",
    require_permission("update_rubric"),
    RubricMiddleware.schema,
    require_in_unit(tbm_rubric_get_department_id),
    RubricController.update
  )
  .delete(
    "/:id",
    require_permission("delete_rubric"),
    require_in_unit(tbm_rubric_get_department_id),
    RubricController.delete
  );
