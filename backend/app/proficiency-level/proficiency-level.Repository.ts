import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma.service";
import { ProficiencyLevelDetailSchema } from "./proficiency-level.Schema";

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
      const where: Prisma.tbm_proficiency_levelWhereInput = {
        ...(search && {
          OR: [
            { id: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      };

      const data = await tx.tbm_proficiency_level
        .findMany({
          where,
          skip: (page - 1) * page_size,
          take: page_size,
          orderBy: { level: "asc" },
        })
        .then((proficiencyLevels) =>
          proficiencyLevels.map((proficiencyLevel) => ({
            ...proficiencyLevel,
            label: `${proficiencyLevel.level} - ${proficiencyLevel.description}`,
          }))
        );

      const count = await tx.tbm_proficiency_level.count({ where });

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
    return await prisma.tbm_proficiency_level.findUnique({
      where: { id },
      include: {
        details: {
          orderBy: { level: "desc" },
        },
      },
    });
  }

  fetchProficiencyLevelDetailByID(id: string) {
    return prisma.tbm_proficiency_level_detail.findUnique({
      where: { id },
    });
  }

  updateProficiencyLevelDetailByID({
    id,
    data,
  }: {
    id: string;
    data: ProficiencyLevelDetailSchema;
  }) {
    return prisma.tbm_proficiency_level_detail.update({
      where: { id },
      data,
    });
  }
}

export const AssessmentMethodRepository = new Repository();
