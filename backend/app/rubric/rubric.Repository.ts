import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma.service";
import { RubricBulkCreateSchema, RubricSchema } from "./rubric.Schema";

class Repository {
  async fetch({
    search,
    page = 1,
    page_size = 10,

    study_program_id,
    course_id,
  }: {
    search?: string;
    page?: number;
    page_size?: number;
    study_program_id?: string;
    course_id?: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const where: Prisma.tbm_rubricWhereInput = {
        is_deleted: false,
        ...(search && {
          OR: [
            { code: { contains: search, mode: "insensitive" } },
            { title: { contains: search, mode: "insensitive" } },
            { description_level_1: { contains: search, mode: "insensitive" } },
            { description_level_2: { contains: search, mode: "insensitive" } },
            { description_level_3: { contains: search, mode: "insensitive" } },
            { description_level_4: { contains: search, mode: "insensitive" } },
            { description_level_5: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(study_program_id && { study_program_id }),
        ...(course_id && {
          study_program: { courses: { some: { id: course_id } } },
        }),
      };

      const data = await tx.tbm_rubric
        .findMany({
          where,
          include: {
            cdio_syllabus: {
              select: {
                level: true,
              },
            },
            student_outcome: {
              select: {
                code: true,
                description: true,
              },
            },
          },
          skip: (page - 1) * page_size,
          take: page_size,
          orderBy: {
            cdio_syllabus: {
              level: "asc",
            },
          },
        })
        .then((rubrics) => {
          return rubrics.map((rubric) => {
            return {
              ...rubric,
              label: `${rubric.cdio_syllabus.level}/${rubric.student_outcome.code}-${rubric.code}`,
            };
          });
        });

      const count = await tx.tbm_rubric.count({ where });

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
    return await prisma.tbm_rubric.findUnique({
      where: { id },
    });
  }

  async create({ data }: { data: RubricSchema }) {
    return await prisma.tbm_rubric.create({
      data,
    });
  }

  async bulkCreate({ data }: { data: RubricBulkCreateSchema }) {
    return await prisma.$transaction(async (tx) => {
      // Fetch the study program
      const studyProgram = await tx.tbm_study_program.findFirst({
        where: { id: data[0].study_program_id, is_deleted: false },
      });

      if (!studyProgram) throw new Error("Study Program not found");

      // Fetch related student outcomes and CDIO syllabuses
      const [studentOutcomes, cdioSyllabuses] = await Promise.all([
        tx.tbm_student_outcome.findMany({
          where: { study_program_id: studyProgram.id, is_deleted: false },
        }),
        tx.tbm_cdio_syllabus.findMany({
          where: { study_program_id: studyProgram.id, is_deleted: false },
        }),
      ]);

      if (studentOutcomes.length === 0)
        throw new Error("Student Outcome not found");

      if (cdioSyllabuses.length === 0)
        throw new Error("CDIO Syllabus not found");

      // Prepare for processing rubrics
      const duplicateCount = { count: 0 };
      const seenRubrics = new Set();

      // Map over data and create or update rubrics concurrently
      const createOrUpdatePromises = data.map(async (rubric) => {
        const uniqueKey = `${rubric.code}-${rubric.student_outcome_code}-${rubric.cdio_syllabus_level}`;

        if (seenRubrics.has(uniqueKey)) {
          duplicateCount.count++;
          return null;
        }
        seenRubrics.add(uniqueKey);

        const studentOutcome = studentOutcomes.find(
          (item) => item.code === rubric.student_outcome_code
        );
        if (!studentOutcome) throw new Error("Student Outcome not found");

        const cdioSyllabus = cdioSyllabuses.find(
          (item) => Number(item.level) === Number(rubric.cdio_syllabus_level)
        );
        if (!cdioSyllabus) throw new Error("CDIO Syllabus not found");

        const existingRubric = await tx.tbm_rubric.findFirst({
          where: {
            code: rubric.code,
            study_program_id: studyProgram.id,
            student_outcome_id: studentOutcome.id,
            cdio_syllabus_id: cdioSyllabus.id,
          },
        });

        if (existingRubric) {
          return tx.tbm_rubric.update({
            where: { id: existingRubric.id },
            data: {
              title: rubric.title,

              description_level_1: rubric.description_level_1,
              description_level_2: rubric.description_level_2,
              description_level_3: rubric.description_level_3,
              description_level_4: rubric.description_level_4,
              description_level_5: rubric.description_level_5,
            },
          });
        } else {
          return tx.tbm_rubric.create({
            data: {
              code: rubric.code,
              title: rubric.title,

              description_level_1: rubric.description_level_1,
              description_level_2: rubric.description_level_2,
              description_level_3: rubric.description_level_3,
              description_level_4: rubric.description_level_4,
              description_level_5: rubric.description_level_5,

              study_program_id: studyProgram.id,
              student_outcome_id: studentOutcome.id,
              cdio_syllabus_id: cdioSyllabus.id,
            },
          });
        }
      });

      // Await all creation or update promises
      const results = await Promise.all(createOrUpdatePromises);

      // Filter out null values to count successfully processed rubrics
      const processedCount = results.filter((result) => result !== null).length;

      return { processedCount, duplicateCount: duplicateCount.count };
    });
  }

  async update({ id, data }: { id: string; data: RubricSchema }) {
    return await prisma.tbm_rubric.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await prisma.tbm_rubric.update({
      where: { id },
      data: {
        is_deleted: true,
      },
    });
  }
}

export const RubricRepository = new Repository();
