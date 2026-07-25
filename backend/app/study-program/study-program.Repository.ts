import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma.service";
import { StudyProgramSchema } from "./study-program.Schema";

class Repository {
  async fetch({
    search,

    page = 1,
    page_size = 10,

    department_id,
    read_for_course = false,

    user_department_id
  }: {
    search?: string;

    page?: number;
    page_size?: number;

    department_id?: string;
    read_for_course?: boolean;

    user_department_id?: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const where: Prisma.tbm_study_programWhereInput = {
        is_deleted: false,
        ...(search && {
          OR: [
            { id: { contains: search, mode: "insensitive" } },
            { title: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
          ],
        }),


        // count of rubrics, cdio_syllabuses, student_outcomes is more than 0
        ...(read_for_course && {
          AND: {
            rubrics: { some: { is_deleted: false } },
            cdio_syllabuses: { some: { is_deleted: false } },
            student_outcomes: { some: { is_deleted: false } },
          },
        }),

        ...(department_id && { department_id }),

        ...(user_department_id && { department_id: user_department_id }),
      };
      const data = await tx.tbm_study_program.findMany({
        where,
        include: {
          department: { select: { title: true } },
          _count: {
            select: {
              rubrics: { where: { is_deleted: false } },
              cdio_syllabuses: { where: { is_deleted: false } },
              student_outcomes: { where: { is_deleted: false } },
            },
          },
        },
        skip: (page - 1) * page_size,
        take: page_size,
        orderBy: { title: "asc" },
      });
      const count = await tx.tbm_study_program.count({ where });
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

  async fetchByID(id: string) {
    return await prisma.tbm_study_program.findFirst({
      where: { id },
      include: {
        department: true,
        _count: {
          select: {
            cdio_syllabuses: { where: { is_deleted: false } },
            student_outcomes: { where: { is_deleted: false } },
            rubrics: { where: { is_deleted: false } },
          },
        },
      },
    });
  }

  async fetchByIDOrCode(id: string) {
    return await prisma.tbm_study_program.findFirst({
      where: {
        OR: [{ id }, { code: id }],
      },
    });
  }

  async store({ data }: { data: StudyProgramSchema }) {
    return await prisma.tbm_study_program.create({ data });
  }

  async update({ id, data }: { id: string; data: StudyProgramSchema }) {
    return await prisma.tbm_study_program.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await prisma.tbm_study_program.update({
      where: { id },
      data: { is_deleted: true },
    });
  }
}

export const ProgramStudiRepository = new Repository();
