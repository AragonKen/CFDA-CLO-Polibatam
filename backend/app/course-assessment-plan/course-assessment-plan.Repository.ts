import { tbm_user } from "@prisma/client";
import prisma from "../../lib/prisma.service";
import { CourseRepository } from "../course/course.Repository";
import { CourseAssessmentPlanSchema } from "./course-assessment-plan.Schema";

class Repository {
  async generate({
    course_id,
    creator,
  }: {
    course_id: string;
    creator: tbm_user;
  }) {
    return await prisma.$transaction(async (tx) => {
      const coursePerformanceIndicators =
        await CourseRepository.fetchCoursePerformanceIndicatorByCourseId({
          course_id,
        });

      await tx.tbm_course_assessment_plan.deleteMany({
        where: { course_id },
      });

      for (const element of coursePerformanceIndicators) {
        await tx.tbm_course_assessment_plan.create({
          data: {
            course_id,
            rubric_id: element.id,
            creator_id: creator.id,
            modifier_id: creator.id,
          },
        });
      }
    });
  }

  async fetch({ course_id }: { course_id: string }) {
    const course = await prisma.tbm_course.findFirst({
      where: { id: course_id, is_deleted: false },
    });

    if (!course) throw new Error("Course not found");

    return await prisma.tbm_course_assessment_plan.findMany({
      where: { course_id },
      include: {
        rubric: {
          include: {
            student_outcome: true,
            cdio_syllabus: true,
          },
        },
      },
      orderBy: {
        rubric: {
          code: "asc",
        },
      },
    });
  }

  async fetchById({ id }: { id: string }) {
    return await prisma.tbm_course_assessment_plan.findFirst({
      where: { id },
    });
  }

  async update({
    id,
    modifier,
    data,
  }: {
    id: string;
    modifier: tbm_user;
    data: CourseAssessmentPlanSchema;
  }) {
    return await prisma.tbm_course_assessment_plan.update({
      where: { id },
      data: {
        ...data,
        modifier_id: modifier.id,
      },
    });
  }
}

export const CourseAssessmentPlanRepository = new Repository();
