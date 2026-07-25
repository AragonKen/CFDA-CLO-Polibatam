import { Router, Request } from "express";
import { StudyProgramController } from "./study-program.Controller";
import { StudyProgramMiddleware } from "./study-program.Middleware";
import { require_in_unit, require_permission } from "../../shared/middleware.Shared";
import prisma from "../../lib/prisma.service";

async function tbm_department_get_id(req: Request) {
  return req.body.department_id;
}

async function tbm_study_program_get_department_id(req: Request) {
  return await prisma.tbm_study_program.findFirst({ select: { department_id: true }, where: { id: req.params.id } })
    .then(data => data!.department_id);
}

export const StudyProgramRoute = Router()
  .get("/", StudyProgramController.get)
  .get("/:id", StudyProgramMiddleware.checkId, StudyProgramController.getOne)
  .post(
    "/",
    require_permission("create_study_program"),
    StudyProgramMiddleware.schema,
    require_in_unit(tbm_department_get_id),
    StudyProgramController.store
  )
  .put(
    "/:id",
    require_permission("update_study_program"),
    StudyProgramMiddleware.checkId,
    StudyProgramMiddleware.schema,
    require_in_unit(tbm_study_program_get_department_id),
    StudyProgramController.update
  )
  .delete(
    "/:id",
    require_permission("delete_study_program"),
    StudyProgramMiddleware.checkId,
    require_in_unit(tbm_study_program_get_department_id),
    StudyProgramController.delete
  ).get(
    "/:id/plo-attainment",
    StudyProgramMiddleware.checkId,
    StudyProgramController.plo_attainment
  );
