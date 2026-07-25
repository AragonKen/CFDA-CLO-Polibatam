import { Prisma, tbm_user } from "@prisma/client";
import prisma from "../../lib/prisma.service";
import { CourseSchema } from "./course.Schema";

class Repository {
  async fetch({
    page = 1,
    page_size = 10,

    search,

    study_program_id,
    user_department_id
  }: {
    page?: number;
    page_size?: number;

    search?: string;

    study_program_id?: string;

    user_department_id?: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const where: Prisma.tbm_courseWhereInput = {
        ...(search && {
          OR: [
            { id: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
            { title: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(study_program_id && { study_program_id }),
        ...(user_department_id && {
          study_program: {
            department_id: user_department_id
          }
        }),
        is_deleted: false,

      };

      const count = await tx.tbm_course.count({ where });

      const data = await tx.tbm_course
        .findMany({
          where,
          orderBy: { code: "asc" },
          skip: (page - 1) * page_size,
          take: page_size,
        })
        .then((courses) =>
          courses.map((course) => ({
            ...course,
            label: `${course.code} - ${course.title}`,
          }))
        );

      return {
        data,
        pagination: {
          page,
          page_size,
          total_items: count,
          total_pages: Math.ceil(count / page_size),
        },
      };
    });
  }

  async fetchById(id: string) {
    return await prisma.tbm_course
      .findFirst({
        where: { id, is_deleted: false },
        include: {
          study_program: {
            include: {
              department: { select: { title: true } },
            },
          },
          assessment_types: {
            include: {
              assessment_type: {
                select: { title: true, code: true },
              },
            },
          },
        },
      })
      .then((course) => {
        const formatted_assessment_types = course?.assessment_types.flatMap(
          (a) =>
            Array.from(
              { length: a.quantity || 0 },
              (_, i) => `${a?.assessment_type?.code}${i + 1}`
            )
        );

        return {
          ...course,
          formatted_assessment_types,
        };
      });
  }

  async fetchByAny(id: string) {
    return await prisma.tbm_course.findFirst({
      where: {
        OR: [{ id }, { code: id }],
        is_deleted: false,
      },
    });
  }

  async store({ data, creator }: { data: CourseSchema; creator: tbm_user }) {
    const existingCourse = await prisma.tbm_course.findFirst({
      where: { code: data.code, is_deleted: false },
    });

    if (existingCourse) {
      throw new Error("Course code already exists");
    }

    const { assessment_types, ...other } = data;

    const course = await prisma.tbm_course.create({
      data: {
        ...other,
        creator_id: creator?.id,
        assessment_types: {
          create: assessment_types.map((assessment) => ({ ...assessment })),
        },
      },
      include: { assessment_types: true },
    });

    return course;
  }

  async update({
    id,
    data,
    modifier,
  }: {
    id: string;
    data: CourseSchema;
    modifier: tbm_user;
  }) {
    const existingCourse = await prisma.tbm_course.findFirst({
      where: { code: data.code, is_deleted: false },
    });

    if (existingCourse && existingCourse.id !== id) {
      throw new Error("Course code already exists");
    }

    const { assessment_types, ...other } = data;

    const course = await prisma.tbm_course.update({
      where: { id },
      data: {
        ...other,
        modifier_id: modifier?.id,
      },
    });

    await prisma.tbm_course_assessment_type.deleteMany({
      where: { course_id: id },
    });

    await prisma.tbm_course_assessment_type.createMany({
      data: assessment_types.map((assessment) => ({
        ...assessment,
        course_id: id,
      })),
      skipDuplicates: true,
    });

    return course;
  }

  async delete({ id, modifier }: { id: string; modifier: tbm_user }) {
    return await prisma.tbm_course.update({
      where: { id },
      data: {
        is_deleted: true,
        modifier_id: modifier?.id,
      },
    });
  }

  // ==============================================================================================
  // Course Assessment Plan
  // ==============================================================================================

  async fetchCoursePerformanceIndicatorByCourseId({
    course_id,
  }: {
    course_id: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const course = await tx.tbm_course.findFirst({
        where: { id: course_id, is_deleted: false },
      });

      if (!course) throw new Error("Course not found");

      const CLORubrics = await tx.tbm_course_learning_outcome_rubric.findMany({
        where: { course_learning_outcome: { course_id }, is_deleted: false },
      });
      const rubricIds: string[] = CLORubrics.map((clr) => clr.rubric_id || "");
      const uniqueRubricIds = Array.from(new Set(rubricIds));

      const rubrics = await tx.tbm_rubric.findMany({
        where: { id: { in: uniqueRubricIds }, is_deleted: false },
        include: {
          student_outcome: true,
          cdio_syllabus: true,
        },
        orderBy: {
          code: "asc",
        },
      });

      return rubrics;
    });
  }
}

export const CourseRepository = new Repository();
