import { Prisma, tbm_user } from "@prisma/client";
import prisma from "../../lib/prisma.service";
import { CourseLearningOutcomeSchema } from "./course-learning-outcome.Schema";

class Repository {
  async fetch({
    page = 1,
    page_size = 10,

    search,

    course_id,
  }: {
    page?: number;
    page_size?: number;

    search?: string;

    course_id?: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const where: Prisma.tbm_course_learning_outcomeWhereInput = {
        ...(search && {
          OR: [
            { code: { contains: search, mode: "insensitive" } },
            { title: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(course_id && { course_id }),
        is_deleted: false,
      };

      const count = await tx.tbm_course_learning_outcome.count({ where });

      const data = await tx.tbm_course_learning_outcome.findMany({
        where,
        include: {
          assessment_method: true,
          rubrics: {
            include: {
              rubric: {
                select: {
                  id: true,
                  code: true,
                  title: true,
                  student_outcome: {
                    select: {
                      code: true,
                    },
                  },
                  cdio_syllabus: {
                    select: {
                      level: true,
                    },
                  },
                },
              },
            },
          },
        },
        skip: (page - 1) * page_size,
        take: page_size,
        orderBy: { code: "asc" },
      });

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
    return await prisma.tbm_course_learning_outcome.findFirst({
      where: { id, is_deleted: false },
      include: {
        rubrics: true,
      },
    });
  }

  async fetchByAny(id: string) {
    return await prisma.tbm_course_learning_outcome.findFirst({
      where: {
        OR: [{ id: id }, { code: id }],
        is_deleted: false,
      },
    });
  }

  async store({
    data,
    creator,
  }: {
    data: CourseLearningOutcomeSchema;
    creator: tbm_user;
  }) {
    return await prisma.$transaction(async (tx) => {
      const { rubrics, ...other } = data;
      console.log(creator);

      const clo = await tx.tbm_course_learning_outcome.create({
        data: {
          ...other,
          creator_id: creator.id,
        },
      });

      for (const rubric_id of rubrics) {
        await tx.tbm_course_learning_outcome_rubric.create({
          data: {
            course_learning_outcome_id: clo.id,
            rubric_id: rubric_id,
            creator_id: creator.id,
          },
        });
      }
    });
  }

  async update({
    id,
    data,
    creator,
  }: {
    id: string;
    data: CourseLearningOutcomeSchema;
    creator: tbm_user;
  }) {
    return await prisma.$transaction(async (tx) => {
      const { rubrics, ...other } = data;

      await tx.tbm_course_learning_outcome.update({
        where: { id },
        data: {
          ...other,
          creator_id: creator.id,
        },
      });

      await tx.tbm_course_learning_outcome_rubric.deleteMany({
        where: { course_learning_outcome_id: id },
      });

      for (const rubric_id of rubrics) {
        await tx.tbm_course_learning_outcome_rubric.create({
          data: {
            course_learning_outcome_id: id,
            rubric_id: rubric_id,
            creator_id: creator.id,
          },
        });
      }
    });
  }

  async delete({ id, modifier }: { id: string; modifier: tbm_user }) {
    return await prisma.tbm_course_learning_outcome.update({
      where: { id },
      data: {
        modifier_id: modifier.id,
        is_deleted: true,
      },
    });
  }
}

export const CourseLearningOutcomeRepository = new Repository();
