import { Router, Request } from "express";
import { CourseController } from "./course.Controller";
import { CourseMiddleware } from "./course.Middleware";
import { require_in_unit, require_permission } from "../../shared/middleware.Shared";
import prisma from "../../lib/prisma.service";

async function tbm_study_program_get_department_id(req: Request) {
  return await prisma.tbm_study_program.findFirst({ select: { department_id: true }, where: { id: req.body.study_program_id }})
    .then(data => data!.department_id);
}

async function tbm_course_get_department_id(req: Request) {
  return await prisma.tbm_course.findFirst({ select: { study_program: { select: { department_id: true }}}, where: { id: req.params.id }})
    .then(data => data!.study_program.department_id);
}

export const CourseRoute = Router()
  .get(
    "/performance-indicator/:id",
    CourseMiddleware.checkId,
    CourseController.getCoursePerformanceIndicatorByCourseId
  )

  .get("/", CourseController.get)
  .get("/:id", CourseMiddleware.checkId, CourseController.getById)
  .post(
    "/",
    require_permission("create_course"),
    CourseMiddleware.schema,
    require_in_unit(tbm_study_program_get_department_id),
    CourseController.create
  )
  .put(
    "/:id",
    require_permission("update_course"),
    CourseMiddleware.checkId,
    CourseMiddleware.schema,
    require_in_unit(tbm_course_get_department_id),
    CourseController.update
  )
  .delete(
    "/:id",
    require_permission("delete_course"),
    CourseMiddleware.checkId,
    require_in_unit(tbm_course_get_department_id),
    CourseController.delete
  );
