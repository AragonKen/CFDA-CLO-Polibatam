import { Prisma, tbm_user } from "@prisma/client";
import prisma from "../../lib/prisma.service";
import {
  CDIOSyllabusBulkSchema,
  CDIOSyllabusParentSchema,
  CDIOSyllabusSchema,
} from "./cdio-syllabus.Schema";

class Repository {
  async bulkStore({
    data,
    creator,
  }: {
    data: CDIOSyllabusBulkSchema;
    creator: tbm_user;
  }) {
    return await prisma.$transaction(async (tx) => {
      const studyProgram = await tx.tbm_study_program.findFirst({
        where: { id: data.study_program_id, is_deleted: false },
      });

      if (!studyProgram) throw new Error("Study Program not found");

      for (const parent of data.data) {
        let parentData = await tx.tbm_cdio_syllabus_parent.findFirst({
          where: {
            level: parent.code,
            study_program_id: data.study_program_id,
          },
        });

        if (parentData) {
          if (parentData.title !== parent.description) {
            parentData = await tx.tbm_cdio_syllabus_parent.update({
              where: { id: parentData.id },
              data: { title: parent.description },
            });
          }
        } else {
          parentData = await tx.tbm_cdio_syllabus_parent.create({
            data: {
              title: parent.description,
              study_program_id: data.study_program_id,
              level: parent.code,
            },
          });
        }

        // Process children in parallel
        await Promise.all(
          parent.children.map(async (child) => {
            let childData = await tx.tbm_cdio_syllabus.findFirst({
              where: {
                level: child.code,
                parent_id: parentData.id,
              },
            });

            if (childData) {
              if (childData.title !== child.description) {
                await tx.tbm_cdio_syllabus.update({
                  where: { id: childData.id },
                  data: { title: child.description },
                });
              }
            } else {
              await tx.tbm_cdio_syllabus.create({
                data: {
                  title: child.description,
                  level: child.code,
                  parent_id: parentData.id,
                  study_program_id: data.study_program_id,
                },
              });
            }
          })
        );
      }
    });
  }

  // ==================================================================================
  // CDIO Syllabus Parent
  // ==================================================================================

  async fetchParent({
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
      const where: Prisma.tbm_cdio_syllabus_parentWhereInput = {
        is_deleted: false,
        ...(search && {
          OR: [{ title: { contains: search, mode: "insensitive" } }],
        }),
        ...(study_program_id && { study_program_id }),
      };

      const data = await tx.tbm_cdio_syllabus_parent.findMany({
        where,
        include: {
          cdio_syllabuses: {
            where: { is_deleted: false },
            orderBy: { level: "asc" },
          },
        },
        skip: (page - 1) * page_size,
        take: page_size,
        orderBy: { level: "asc" },
      });

      const count = await tx.tbm_cdio_syllabus_parent.count({ where });

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

  async fetchParentByID(id: string) {
    return await prisma.tbm_cdio_syllabus_parent.findUnique({
      where: { id },
      include: {
        cdio_syllabuses: true,
      },
    });
  }

  async storeParent({ data }: { data: CDIOSyllabusParentSchema }) {
    return await prisma.$transaction(async (tx) => {
      const count = await tx.tbm_cdio_syllabus_parent.count({
        where: { study_program_id: data.study_program_id, is_deleted: false },
      });

      return await tx.tbm_cdio_syllabus_parent.create({
        data: {
          ...data,
          level: count + 1,
        },
      });
    });
  }

  async updateParent({
    id,
    data,
  }: {
    id: string;
    data: CDIOSyllabusParentSchema;
  }) {
    return await prisma.tbm_cdio_syllabus_parent.update({
      where: { id },
      data,
    });
  }

  async deleteParent(id: string) {
    const children = await prisma.tbm_cdio_syllabus.findMany({
      where: { parent_id: id },
    });

    if (children.length > 0) {
      throw new Error("CDIO Syllabus has children");
    }

    return await prisma.tbm_cdio_syllabus_parent.update({
      where: { id },
      data: { is_deleted: true },
    });
  }

  // ==================================================================================
  // CDIO Syllabus
  // ==================================================================================

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
      const isSearchNumber = !isNaN(Number(search));

      const where: Prisma.tbm_cdio_syllabusWhereInput = {
        is_deleted: false,
        ...(search && {
          OR: [
            { id: { contains: search, mode: "insensitive" } },
            { level: isSearchNumber ? search : undefined },
            { title: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(study_program_id && { study_program_id }),
      };

      const data = await tx.tbm_cdio_syllabus
        .findMany({
          where,
          include: {
            parent: true,
          },
          skip: (page - 1) * page_size,
          take: page_size,
          orderBy: { level: "asc" },
        })
        .then((res) =>
          res.map((item) => ({
            ...item,
            label: `${item.level} - ${item.title}`,
          }))
        );

      const count = await tx.tbm_cdio_syllabus.count({ where });

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
    return await prisma.tbm_cdio_syllabus.findUnique({
      where: { id },
      include: {
        parent: true,
      },
    });
  }

  async store({ data }: { data: CDIOSyllabusSchema }) {
    return await prisma.$transaction(async (tx) => {
      const parent = await tx.tbm_cdio_syllabus_parent.findUnique({
        where: { id: data.parent_id },
      });

      if (!parent) throw new Error("Parent not found");

      const count = await tx.tbm_cdio_syllabus.count({
        where: { parent_id: data.parent_id, is_deleted: false },
      });

      return await tx.tbm_cdio_syllabus.create({
        data: {
          ...data,
          level: `${parent.level}.${count + 1}`,
        },
      });
    });
  }

  async update({ id, data }: { id: string; data: CDIOSyllabusSchema }) {
    return await prisma.tbm_cdio_syllabus.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await prisma.tbm_cdio_syllabus.update({
      where: { id },
      data: { is_deleted: true },
    });
  }
}

export const CDIOSyllabusRepository = new Repository();
