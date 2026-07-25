import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma.service";
import { AssessmentMethodSchema } from "./assessment-method.Schema";

class Repository {
  async fetch({
    search,
    page = 1,
    page_size = 10,
  }: {
    search?: string;
    page?: number;
    page_size?: number;
  }) {
    return await prisma.$transaction(async (tx) => {
      const where: Prisma.tbm_assessment_methodWhereInput = {
        is_deleted: false,
        ...(search && { title: { contains: search } }),
      };

      const data = await tx.tbm_assessment_method.findMany({
        where,
        skip: (page - 1) * page_size,
        take: page_size,
      });

      const count = await tx.tbm_assessment_method.count({ where });

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
    return await prisma.tbm_assessment_method.findFirst({
      where: { id, is_deleted: false },
    });
  }

  async store({ data }: { data: AssessmentMethodSchema }) {
    return await prisma.tbm_assessment_method.create({
      data: data,
    });
  }

  async update({ id, data }: { id: string; data: AssessmentMethodSchema }) {
    return await prisma.tbm_assessment_method.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await prisma.tbm_assessment_method.update({
      where: { id },
      data: { is_deleted: true },
    });
  }
}

export const AssessmentMethodRepository = new Repository();
