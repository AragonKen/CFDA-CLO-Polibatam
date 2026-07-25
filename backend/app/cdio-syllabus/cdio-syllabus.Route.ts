import { Router, Request } from "express";
import { CDIOSyllabusController } from "./cdio-syllabus.Controller";
import { CDIOSyllabusMiddleware } from "./cdio-syllabus.Middleware";

import { require_permission, require_in_unit } from "../../shared/middleware.Shared";
import prisma from "../../lib/prisma.service";

async function tbm_study_program_get_department_id(req: Request): Promise<string> {
  return await prisma.tbm_study_program.findFirst({
    select: { department_id: true },
    where: { id: req.body.study_program_id }
  }).then(data => data!.department_id);
}

async function tbm_cdio_syllabus_parent_get_department_id(req: Request): Promise<string> {
  return await prisma.tbm_cdio_syllabus_parent.findFirst({
    select: {
      study_program: {
        select: { department_id: true }
      }
    },
    where: { id: req.params.id }
  }).then(data => data!.study_program.department_id);
}

async function tbm_cdio_syllabus_get_department_id(req: Request): Promise<string> {
  return await prisma.tbm_cdio_syllabus.findFirst({
    select: {
      study_program: {
        select: { department_id: true }
      }
    },
    where: { id: req.params.id }
  }).then(data => data!.study_program.department_id);
}

export const CDIOSyllabusRoute = Router()
  .post(
    "/bulk",
    require_permission("create_cdio_syllabus"),
    CDIOSyllabusMiddleware.bulkSchema,
    require_in_unit(tbm_study_program_get_department_id),
    CDIOSyllabusController.bulkCreate
  )

  // Parent Routes
  .get("/parent", CDIOSyllabusController.getParent)
  .get("/parent/:id", CDIOSyllabusController.getParentByID)
  .post(
    "/parent",
    require_permission("create_cdio_syllabus"),
    CDIOSyllabusMiddleware.schemaParent,
    require_in_unit(tbm_study_program_get_department_id),
    CDIOSyllabusController.createParent
  )
  .put(
    "/parent/:id",
    require_permission("update_cdio_syllabus"),
    CDIOSyllabusMiddleware.schemaParent,
    require_in_unit(tbm_cdio_syllabus_parent_get_department_id),
    CDIOSyllabusController.updateParent
  )
  .delete(
    "/parent/:id",
    require_permission("delete_cdio_syllabus"),
    require_in_unit(tbm_cdio_syllabus_parent_get_department_id),
    CDIOSyllabusController.deleteParent
  )

  // CDIO Syllabus Routes
  .get(
    "/",
    CDIOSyllabusController.get
  )
  .get("/:id", CDIOSyllabusController.getByID)
  .post(
    "/",
    require_permission("create_cdio_syllabus"),
    CDIOSyllabusMiddleware.schema,
    require_in_unit(tbm_study_program_get_department_id),
    CDIOSyllabusController.create
  )
  .put(
    "/:id",
    require_permission("update_cdio_syllabus"),
    CDIOSyllabusMiddleware.schema,
    require_in_unit(tbm_cdio_syllabus_get_department_id),
    CDIOSyllabusController.update
  )
  .delete(
    "/:id",
    require_permission("delete_cdio_syllabus"),
    require_in_unit(tbm_cdio_syllabus_get_department_id),
    CDIOSyllabusController.delete
  );
