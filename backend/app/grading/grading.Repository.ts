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
      const where: Prisma.tbm_gradingWhereInput = {
        is_deleted: false,
        ...(search && {
          category: {
            title: { contains: search, mode: "insensitive" },
          },
        }),
      };

      const data = await tx.tbm_grading.findMany({
        where,
        include: {
          category: { select: { title: true } },
        },
        skip: (page - 1) * page_size,
        take: page_size,
        orderBy: { upper_limit: "desc" },
      });

      const count = await tx.tbm_grading.count({ where });

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

export const GradingRepository = new Repository();
