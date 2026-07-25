import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma.service";

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
      const where: Prisma.tbm_assessment_typeWhereInput = {
        ...(search && { title: { contains: search } }),
      };

      const data = await tx.tbm_assessment_type.findMany({
        where,
        skip: (page - 1) * page_size,
        take: page_size,
      });

      const count = await tx.tbm_assessment_type.count({ where });

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
}

export const AssessmentTypeRepository = new Repository();
