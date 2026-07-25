import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma.service";
import { DepartmentSchema } from "./department.Schema";

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
      const where: Prisma.tbm_departmentWhereInput = {
        is_deleted: false,
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
          ],
        }),
      };

      const data = await tx.tbm_department.findMany({
        where,
        include: {
          _count: {
            select: { studi_programs: true },
          },
        },
        skip: (page - 1) * page_size,
        take: page_size,
        orderBy: { title: "asc" },
      });

      const count = await tx.tbm_department.count({ where });

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
    return await prisma.tbm_department.findFirst({
      where: { id },
      include: {
        _count: { select: { studi_programs: true } },
      },
    });
  }

  async fetchByIDOrCode(id: string) {
    return await prisma.tbm_department.findFirst({
      where: {
        OR: [{ id }, { code: id }],
        is_deleted: false,
      },
    });
  }

  async store({ data }: { data: DepartmentSchema }) {
    return await prisma.tbm_department.create({
      data: data,
    });
  }

  async update({ id, data }: { id: string; data: DepartmentSchema }) {
    return await prisma.tbm_department.update({
      where: { id },
      data: data,
    });
  }

  async delete({ id }: { id: string }) {
    return await prisma.tbm_department.update({
      where: { id },
      data: { is_deleted: true },
    });
  }
}

export const JurusanRepository = new Repository();
