import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma.service";
import {
  StudentOutcomeBulkSchema,
  StudentOutcomeSchema,
} from "./student-outcome.Schema";

class Repository {
  async fetch({
    search,

    page = 1,
    page_size = 10,

    study_program_id,
  }: {
    search?: string;

    page?: number;
    page_size?: number;

    study_program_id?: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const where: Prisma.tbm_student_outcomeWhereInput = {
        is_deleted: false,
        ...(search && {
          OR: [
            { id: { contains: search } },
            { code: { contains: search, mode: "insensitive" } },
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(study_program_id && { study_program_id }),
      };

      const data = await tx.tbm_student_outcome
        .findMany({
          where,
          skip: (page - 1) * page_size,
          take: page_size,
          orderBy: { order: "asc" },
        })
        .then((res) =>
          res.map((item) => ({
            ...item,
            label: `${item.code} - ${item.description}`,
          }))
        );

      const count = await tx.tbm_student_outcome.count({ where });

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

  async findByID(id: string) {
    return await prisma.tbm_student_outcome.findUnique({
      where: { id },
    });
  }

  async create({ data }: { data: StudentOutcomeSchema }) {
    return await prisma.$transaction(async (tx) => {
      const count = await tx.tbm_student_outcome.count({
        where: { study_program_id: data.study_program_id, is_deleted: false },
      });

      const order = count + 1;

      return await tx.tbm_student_outcome.create({
        data: {
          ...data,
          order: order,
          code: `SO${order}`,
        },
      });
    });
  }

  private checkCodeFormat(codes: string[]) {
    const errors = codes
      .filter(
        (code) =>
          code &&
          (!code.startsWith("SO") ||
            isNaN(parseInt(code.replace("SO", ""), 10)))
      )
      .map((code) => `Invalid code format: ${code}`);

    if (errors.length) {
      throw new Error(errors.join(", "));
    }
  }

  async bulkCreate({ data, study_program_id }: StudentOutcomeBulkSchema) {
    return await prisma.$transaction(async (tx) => {
      const existingOutcomes = await tx.tbm_student_outcome.findMany({
        where: { study_program_id, is_deleted: false },
        select: { code: true, id: true },
      });

      const existingCodes = new Set(existingOutcomes.map((o) => o.code));
      let order = existingOutcomes.length + 1;

      // Validate codes
      this.checkCodeFormat(data.map((item) => item.code || ""));

      for (const item of data) {
        const newCode = item.code || `SO${order}`;

        if (existingCodes.has(newCode)) {
          const existingOutcome = existingOutcomes.find(
            (o) => o.code === newCode
          );
          if (existingOutcome) {
            await tx.tbm_student_outcome.update({
              where: { id: existingOutcome.id },
              data: { ...item, study_program_id },
            });
          }
        } else {
          await tx.tbm_student_outcome.create({
            data: {
              ...item,
              study_program_id,
              order,
              code: newCode,
            },
          });
          existingCodes.add(newCode);
          order++;
        }
      }
    });
  }

  async update({ id, data }: { id: string; data: StudentOutcomeSchema }) {
    return await prisma.$transaction(async (tx) => {
      return await tx.tbm_student_outcome.update({
        where: { id },
        data,
      });
    });
  }

  async delete(id: string) {
    return await prisma.tbm_student_outcome.update({
      where: { id },
      data: { is_deleted: true },
    });
  }
}

export const StudentOutcomeRepository = new Repository();
