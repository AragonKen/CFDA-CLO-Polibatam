import { Prisma, tbm_proficiency_level_detail, tbm_user } from "@prisma/client";
import prisma from "../../lib/prisma.service";
import {
  AssessmentGradeBulkSchema,
  AssessmentGradeSchema,
  AssessmentSchema,
} from "./assessment.Schema";
import { Assessment } from "../../constants";
import { getDataByKeys } from "../../utils/utils";

class Repository {
  async fetch({
    page = 1,
    page_size = 10,
    search,
    user_department_id
  }: {
    page?: number;
    page_size?: number;
    search?: string;
    department_str?: string;

    user_department_id?: string;
  }) {
    return await prisma.$transaction(
      async (tx) => {
        const where: Prisma.tbm_assessmentWhereInput = {
          is_deleted: false,
          ...(search && {
            OR: [
              { course: { code: { contains: search, mode: "insensitive" } } },
              { course: { title: { contains: search, mode: "insensitive" } } },
              { semester: { contains: search, mode: "insensitive" } },
              { academic_year: { contains: search, mode: "insensitive" } },
              { class: { contains: search, mode: "insensitive" } },
            ],
          }),
          ...(user_department_id && {
            course: {
              study_program: {
                department: {
                  id: user_department_id,
                },
              },
            },
          }),
        };

        const count = await tx.tbm_assessment.count({ where });

        const data = await tx.tbm_assessment.findMany({
          where,
          include: {
            course: {
              select: {
                code: true,
                title: true,
              },
            },
            teacher: {
              select: {
                name: true,
              },
            },
            proficiency_level: {
              select: {
                level: true,
                description: true,
              },
            },
          },
          take: page_size,
          skip: (page - 1) * page_size,
        });

        return {
          data,
          pagination: {
            page: page,
            page_size: page_size,
            total_items: count,
            total_pages: Math.ceil(count / page_size),
          },
        };
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );
  }

  async fetchById(id: string) {
    return await prisma.tbm_assessment.findFirst({
      where: {
        id,
        is_deleted: false,
      },
      include: {
        course: {
          include: {
            assessment_types: {
              include: {
                assessment_type: {
                  select: {
                    title: true,
                    code: true,
                    background_color: true,
                  },
                },
              },
              orderBy: {
                quantity: "desc",
              },
            },
          },
        },
        teacher: {
          select: {
            name: true,
            id: true,
          },
        },
        proficiency_level: {
          select: {
            level: true,
            description: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    });
  }

  async store({
    data,
    creator,
  }: {
    data: AssessmentSchema;
    creator: tbm_user;
  }) {
    return await prisma.tbm_assessment.create({
      data: {
        ...data,
        creator_id: creator.id,
      },
    });
  }

  async update({
    id,
    data,
    modifier,
  }: {
    id: string;
    data: AssessmentSchema;
    modifier: tbm_user;
  }) {
    return await prisma.tbm_assessment.update({
      where: { id },
      data: {
        ...data,
        modifier_id: modifier.id,
      },
    });
  }

  async delete({ id, modifier }: { id: string; modifier: tbm_user }) {
    return await prisma.tbm_assessment.update({
      where: { id },
      data: {
        is_deleted: true,
        modifier_id: modifier.id,
      },
    });
  }

  // DETAILS

  private async generateHandsontableHeader({
    assessment_id,
    hide_student = false,
  }: {
    assessment_id: string;
    hide_student?: boolean;
  }) {
    return await prisma.$transaction(
      async (tx) => {
        if (!assessment_id) throw new Error("Assessment ID is required");

        const assessment = await this.fetchById(assessment_id);
        if (!assessment) throw new Error("Assessment not found");

        // generate header first
        const headers: {
          label: string;
          colspan?: number;
          background_color?: string;
        }[] = [];

        const headers2: {
          label: string;
          colspan?: number;
          background_color?: string;
          is_score?: boolean;
        }[] = [];

        if (!hide_student) {
          headers.push({ label: "", colspan: 1 });
          headers.push({ label: "", colspan: 1 });

          headers2.push({ label: "NIM", colspan: 1 });
          headers2.push({ label: "Student Name", colspan: 1 });
        }

        for (const element of assessment.course?.assessment_types || []) {
          const exams = ["MSE", "FSE"];
          const title = exams.includes(String(element?.assessment_type?.code))
            ? "Exam"
            : element?.assessment_type?.title;

          headers.push({
            label: `${title} (${element?.weight}%)`,
            colspan: element?.quantity || 1,
            background_color: String(
              element?.assessment_type?.background_color
            ),
          });

          for (let i = 0; i < (element?.quantity || 1); i++) {
            headers2.push({
              label: `${element?.assessment_type?.code}${i + 1}`,
              colspan: 1,
              background_color: String(
                element?.assessment_type?.background_color
              ),
              is_score: true,
            });
          }
        }

        return {
          assessment,
          headers,
          headers2,
        };
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );
  }

  async fetchHandsontable({ assessment_id }: { assessment_id: string }) {
    return await prisma.$transaction(
      async (tx) => {
        const { assessment, headers, headers2 } =
          await this.generateHandsontableHeader({
            assessment_id,
          });

        headers2.push({
          label: "Final",
          colspan: 1,
          background_color: Assessment.Colors.FinalScore,
        });
        headers2.push({
          label: "Grade",
          colspan: 1,
          background_color: Assessment.Colors.Grade,
        });
        headers2.push({
          label: "PL",
          colspan: 1,
          background_color: Assessment.Colors.ProficiencyLevel,
        });

        const students = await prisma.tbm_assessment_student.findMany({
          where: { assessment_id },
          include: {
            student: {
              select: {
                nim: true,
                name: true,
              },
            },
            scores: {
              include: {
                assessment_type: {
                  select: {
                    code: true,
                    background_color: true,
                  },
                },
                proficiency_level_detail: {
                  select: {
                    level: true,
                  },
                },
              },
            },
            grading: {
              select: {
                grade: true,
              },
            },
            proficiency_level_detail: {
              select: {
                level: true,
              },
            },
          },
          orderBy: {
            student: {
              name: "asc",
            },
          },
        });

        const gradings = await prisma.tbm_grading.findMany({
          where: { is_deleted: false },
        });

        const proficiency_levels =
          await prisma.tbm_proficiency_level_detail.findMany({
            where: {
              proficiency_level_id: assessment.proficiency_level_id,
              is_deleted: false,
            },
          });

        const columns = students.map((student, index) => {
          const scores = student.scores.reduce((acc, score) => {
            (acc as any)[String(score?.assessment_type?.code) + score?.index] =
              score.score;
            return acc;
          }, {});

          const scoreCount = Object.keys(scores).length;
          const startCol = 2; // 'nim' = col 0, 'name' = col 1, scores start at 2
          const finalScoreColIndex = startCol + scoreCount; // dynamic based on # of scores
          const rowNumber = index + 1; // +1 for 0-based, +1 for header row

          const colToLetter = (colIndex: number) => {
            let letter = "";
            while (colIndex >= 0) {
              letter = String.fromCharCode((colIndex % 26) + 65) + letter;
              colIndex = Math.floor(colIndex / 26) - 1;
            }
            return letter;
          };

          const startCell = `${colToLetter(startCol)}${rowNumber}`;
          const endCell = `${colToLetter(
            startCol + scoreCount - 1
          )}${rowNumber}`;
          const finalScoreCell = `${colToLetter(
            finalScoreColIndex
          )}${rowNumber}`;

          // Generate weighted average formula based on assessment types
          const final_score_formula = (() => {
            let currentCol = startCol;
            const weightedParts: string[] = [];

            for (const assessmentType of assessment.course?.assessment_types ||
              []) {
              const quantity = assessmentType.quantity || 1;
              const weight = Number(assessmentType.weight) / 100;

              // Get the range of columns for this assessment type
              const typeStartCell = `${colToLetter(currentCol)}${rowNumber}`;
              const typeEndCell = `${colToLetter(
                currentCol + quantity - 1
              )}${rowNumber}`;

              // Calculate weighted contribution: AVERAGE(range) * weight
              weightedParts.push(
                `(AVERAGE(${typeStartCell}:${typeEndCell})*${weight})`
              );

              currentCol += quantity;
            }

            // Sum all weighted parts and round to 2 decimal places
            return `=ROUND(${weightedParts.join("+")}, 2)`;
          })();

          const grading_formula = () => {
            const sortedGradings = [...gradings].sort(
              (a, b) => Number(b.lower_limit) - Number(a.lower_limit)
            );
            const conditions = sortedGradings.map(
              (g) => `${finalScoreCell}>=${g.lower_limit},"${g.grade}"`
            );
            return `=IFS(${conditions.join(",")})`;
          };

          const proficiency_formula = () => {
            const sortedLevels = [...proficiency_levels].sort(
              (a, b) => Number(b.lower_limit) - Number(a.lower_limit)
            );
            const conditions = sortedLevels.map(
              (p) => `${finalScoreCell}>=${p.lower_limit},"${p.level}"`
            );
            return `=IFS(${conditions.join(",")})`;
          };

          return {
            id: student.id,
            no: index + 1,
            nim: student.student?.nim,
            name: student.student?.name,
            scores,
            final_score: student.final_score,
            final_score_formula,
            grading_formula: grading_formula(),
            proficiency_formula: proficiency_formula(),
            grading: student.grading?.grade,
            assessment_student_id: student.id,
            proficiency_level: student.proficiency_level_detail?.level,
            background_color: {
              final_score: Assessment.Colors.FinalScore,
              grading: Assessment.Colors.Grade,
              proficiency_level: Assessment.Colors.ProficiencyLevel,
            },
          };
        });

        return {
          headers: [headers, headers2],
          columns,
        };
      },
      {
        maxWait: 10000, // Wait up to 10 seconds to start the transaction
        timeout: 20000, // Transaction can run for up to 20 seconds
      }
    );
  }

  private async generateTableHeader({
    assessment_id,
    hide_student = false,
  }: {
    assessment_id: string;
    hide_student?: boolean;
  }) {
    return await prisma.$transaction(async (tx) => {
      if (!assessment_id) throw new Error("Assessment ID is required");

      const assessment = await this.fetchById(assessment_id);
      if (!assessment) throw new Error("Assessment not found");

      // generate header first
      const headers: {
        key: string;
        rowspan?: number;
        colspan?: number;
        background_color?: string;
      }[] = [];

      if (!hide_student) {
        headers.push({ key: "No", rowspan: 2, colspan: 1 });
        headers.push({ key: "NIM", rowspan: 2, colspan: 1 });
        headers.push({ key: "Student Name", rowspan: 2, colspan: 1 });
      }

      const headers2: {
        key: string;
        rowspan?: number;
        colspan?: number;
        background_color?: string;
      }[] = [];

      for (const element of assessment.course?.assessment_types || []) {
        const exams = ["MSE", "FSE"];
        const title = exams.includes(String(element?.assessment_type?.code))
          ? "Exam"
          : element?.assessment_type?.title;

        headers.push({
          key: `${title} (${element?.weight}%)`,
          colspan: element?.quantity || 1,
          rowspan: 1,
          background_color: String(element?.assessment_type?.background_color),
        });

        for (let i = 0; i < (element?.quantity || 1); i++) {
          headers2.push({
            key: `${element?.assessment_type?.code}${i + 1}`,
            colspan: 1,
            rowspan: 1,
            background_color: String(
              element?.assessment_type?.background_color
            ),
          });
        }
      }

      return {
        headers,
        headers2,
      };
    });
  }

  async fetchGeneratedForm({ assessment_id }: { assessment_id: string }) {
    return await prisma.$transaction(
      async (tx) => {
        const { headers, headers2 } = await this.generateTableHeader({
          assessment_id,
        });

        const handsontable_header = await this.generateHandsontableHeader({
          assessment_id,
        });

        headers.push({
          key: "Final",
          rowspan: 2,
          colspan: 1,
          background_color: Assessment.Colors.FinalScore,
        });
        headers.push({
          key: "Grade",
          rowspan: 2,
          colspan: 1,
          background_color: Assessment.Colors.Grade,
        });
        headers.push({
          key: "Proficiency Level",
          rowspan: 2,
          colspan: 1,
          background_color: Assessment.Colors.ProficiencyLevel,
        });
        // items

        const students = await prisma.tbm_assessment_student.findMany({
          where: { assessment_id },
          include: {
            student: {
              select: {
                nim: true,
                name: true,
              },
            },
            scores: {
              include: {
                assessment_type: {
                  select: {
                    code: true,
                    background_color: true,
                  },
                },
                proficiency_level_detail: {
                  select: {
                    level: true,
                  },
                },
              },
            },
            grading: {
              select: {
                grade: true,
              },
            },
            proficiency_level_detail: {
              select: {
                level: true,
              },
            },
          },
          orderBy: {
            student: {
              name: "asc",
            },
          },
        });

        const items = students.map((student, index) => {
          const scores = student.scores.reduce((acc, score) => {
            (acc as any)[String(score?.assessment_type?.code) + score?.index] =
              score.score;
            return acc;
          }, {});

          // const proficiency_levels = student.scores.reduce((acc, score) => {
          //   (acc as any)[String(score?.assessment_type?.code) + score?.index] =
          //     score.proficiency_level_detail?.level;
          //   return acc;
          // }, {});

          return {
            id: student.id,
            no: index + 1,
            nim: student.student?.nim,
            name: student.student?.name,
            scores,
            // proficiency_levels,
            final_score: student.final_score,
            grading: student.grading?.grade,
            assessment_student_id: student.id,
            proficiency_level: student.proficiency_level_detail?.level,
            background_color: {
              final_score: Assessment.Colors.FinalScore,
              grading: Assessment.Colors.Grade,
              proficiency_level: Assessment.Colors.ProficiencyLevel,
            },
          };
        });

        return {
          headers: [headers, headers2],
          handsontable_header: [
            handsontable_header.headers,
            handsontable_header.headers2,
          ],
          items,
        };
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );
  }

  async upsertAssessmentStudent({
    assessment_id,
    data,
    creator,
  }: {
    assessment_id: string;
    data: AssessmentGradeSchema;
    creator: tbm_user;
  }) {
    return prisma.$transaction(
      async (tx) => {
        const assessment = await this.fetchById(assessment_id);
        if (!assessment) throw new Error("Assessment not found");

        const student = await this.upsertStudent({
          nim: data.nim,
          name: data.name,
        });

        const [
          assessmentTypes,
          courseAssessmentTypes,
          gradings,
          proficiencyLevels,
        ] = await Promise.all([
          prisma.tbm_assessment_type.findMany({
            select: { id: true, code: true, title: true },
          }),
          prisma.tbm_course_assessment_type.findMany({
            where: { course_id: assessment.course_id },
          }),
          prisma.tbm_grading.findMany({
            where: { is_deleted: false },
          }),
          prisma.tbm_proficiency_level_detail.findMany({
            where: {
              proficiency_level_id: assessment.proficiency_level_id,
              is_deleted: false,
            },
          }),
        ]);

        let assessmentStudent = await tx.tbm_assessment_student.findFirst({
          where: {
            assessment_id,
            student_id: student.id,
          },
        });

        if (!assessmentStudent) {
          assessmentStudent = await tx.tbm_assessment_student.create({
            data: {
              assessment_id,
              student_id: student.id,
              creator_id: creator?.id,
            },
          });
        }

        await this.updateOrCreateAssessmentScores({
          tx,
          scores: data.scores,
          assessmentTypes: assessmentTypes as any,
          assessmentStudentId: assessmentStudent.id,
          proficiencyLevels,
        });

        const scores = await tx.tbm_assessment_student_score.findMany({
          where: { assessment_student_id: assessmentStudent.id },
        });

        const finalScore = await this.calculateFinalScore(
          scores as any,
          courseAssessmentTypes as any
        );

        const grade = gradings.find(
          (g) =>
            Number(finalScore.toFixed(0)) >= Number(g.lower_limit) &&
            Number(finalScore.toFixed(0)) <= Number(g.upper_limit)
        );

        const proficiencyLevelDetail = proficiencyLevels.find(
          (g) =>
            Number(finalScore.toFixed(0)) >= Number(g.lower_limit) &&
            Number(finalScore.toFixed(0)) <= Number(g.upper_limit)
        );

        return tx.tbm_assessment_student.update({
          where: { id: assessmentStudent.id },
          data: {
            final_score: finalScore.toFixed(2),
            proficiency_level_detail_id: proficiencyLevelDetail?.id,
            grading_id: grade?.id,
          },
        });
      },
      {
        maxWait: 5000, // default: 2000
        timeout: 10000, // default: 5000
      }
    );
  }

  async bulkStoreAssessmentStudent({
    assessment_id,
    data,
    creator,
  }: {
    assessment_id: string;
    data: AssessmentGradeBulkSchema;
    creator: tbm_user;
  }) {
    // Process in batches to avoid timeout
    const BATCH_SIZE = 5;
    const results = [];

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);

      // Process batch concurrently but limit to avoid overwhelming the database
      const batchPromises = batch.map(async (item) => {
        try {
          return await this.upsertAssessmentStudent({
            assessment_id,
            data: item,
            creator,
          });
        } catch (error) {
          console.error(`Error processing student ${item.nim}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);

      console.log(
        `Bulk store progress: ${Math.min(i + BATCH_SIZE, data.length)}/${
          data.length
        }`
      );
    }

    return results;
  }

  // New method for individual student updates (optimized)
  async updateSingleAssessmentStudent({
    assessment_id,
    data,
    creator,
  }: {
    assessment_id: string;
    data: AssessmentGradeBulkSchema[0];
    creator: tbm_user;
  }) {
    return await this.upsertAssessmentStudent({
      assessment_id,
      data,
      creator,
    });
  }

  // New method for deleting assessment student
  async deleteAssessmentStudent({
    assessment_id,
    nim,
    modifier,
  }: {
    assessment_id: string;
    nim: string;
    modifier: tbm_user;
  }) {
    return await prisma.$transaction(
      async (tx) => {
        const student = await tx.tbm_student.findFirst({
          where: { nim },
        });

        if (!student) {
          throw new Error("Student not found");
        }

        const assessmentStudent = await tx.tbm_assessment_student.findFirst({
          where: {
            assessment_id,
            student_id: student.id,
          },
        });

        if (!assessmentStudent) {
          throw new Error("Assessment student not found");
        }

        // Delete scores first
        await tx.tbm_assessment_student_score.deleteMany({
          where: {
            assessment_student_id: assessmentStudent.id,
          },
        });

        // Delete assessment student
        return await tx.tbm_assessment_student.delete({
          where: {
            id: assessmentStudent.id,
          },
        });
      },
      {
        maxWait: 3000,
        timeout: 5000,
      }
    );
  }

  private async upsertStudent({ nim, name }: { nim: string; name: string }) {
    const existingStudent = await prisma.tbm_student.findFirst({
      where: { nim },
    });

    return existingStudent
      ? prisma.tbm_student.update({ where: { nim }, data: { name } })
      : prisma.tbm_student.create({ data: { nim, name } });
  }

  private getCharBeforeNumber(key: string) {
    const match = key.match(/^\D+/); // Matches all leading non-digit characters
    return match ? match[0] : "";
  }

  private async updateOrCreateAssessmentScores({
    tx,
    scores,
    assessmentTypes,
    assessmentStudentId,
    proficiencyLevels,
  }: {
    tx: Prisma.TransactionClient;
    scores: { key: string; value: number }[];
    assessmentTypes: { id: string; code: string; title: string }[];
    assessmentStudentId: string;
    proficiencyLevels: tbm_proficiency_level_detail[];
  }) {
    for (const grade of scores) {
      let gradeCode = this.getCharBeforeNumber(grade.key);

      const assessmentType = assessmentTypes.find(
        (type) => type.code === gradeCode
      );

      // Check if assessment type exists before proceeding
      if (!assessmentType) {
        console.error(`Assessment type not found for key: ${grade.key}`);
        // throw new Error(`Assessment type not found for key: ${grade.key}`);
        continue;
      }

      const index = Number(grade.key.replace(String(assessmentType.code), ""));

      const existingScore = await tx.tbm_assessment_student_score.findFirst({
        where: {
          assessment_student_id: assessmentStudentId,
          assessment_type_id: assessmentType.id,
          index,
        },
      });

      const proficiencyLevelDetail = proficiencyLevels.find(
        (g) =>
          Number(grade.value.toFixed(0)) >= Number(g.lower_limit) &&
          Number(grade.value.toFixed(0)) <= Number(g.upper_limit)
      );

      if (existingScore) {
        await tx.tbm_assessment_student_score.update({
          where: { id: existingScore.id },
          data: {
            score: grade.value,
            proficiency_level_detail_id: proficiencyLevelDetail?.id,
          },
        });
      } else {
        await tx.tbm_assessment_student_score.create({
          data: {
            index,
            score: grade.value,
            proficiency_level_detail_id: proficiencyLevelDetail?.id,
            assessment_student_id: assessmentStudentId,
            assessment_type_id: assessmentType.id, // This must be valid
          },
        });
      }
    }
  }

  private async calculateFinalScore(
    scores: { assessment_type_id: string; score: number }[],
    courseAssessmentTypes: {
      assessment_type_id: string;
      weight: number;
      quantity: number;
    }[]
  ) {
    return courseAssessmentTypes.reduce((finalScore, type) => {
      const scoresByType = scores.filter(
        (s) => s.assessment_type_id === type.assessment_type_id
      );
      const totalScore = scoresByType.reduce(
        (sum, s) => sum + Number(s.score),
        0
      );

      return (
        finalScore +
        (totalScore / Number(type.quantity)) * (Number(type.weight) / 100)
      );
    }, 0);
  }

  // =======================================================================================================================================================
  // Step 5. Percentage of Students within Each Category
  // =======================================================================================================================================================

  async fetchPercentagePerCategory(assessment_id: string) {
    return await prisma.$transaction(
      async (tx) => {
        const { headers, headers2 } = await this.generateTableHeader({
          assessment_id,
          hide_student: true,
        });
        headers.unshift({ key: "Category", rowspan: 2, colspan: 1 });

        const grading = await tx.tbm_grading_category
          .findMany({
            where: { is_deleted: false },
            include: {
              grading: {
                select: {
                  grade: true,
                  lower_limit: true,
                  upper_limit: true,
                },
              },
            },
          })
          .then((categories) => {
            return categories.map((category) => {
              return {
                ...category,
                lower_limit: category.grading.sort(
                  (a, b) => Number(a.lower_limit) - Number(b.lower_limit)
                )[0].lower_limit,
                upper_limit: category.grading
                  .sort((a, b) => Number(a.upper_limit) - Number(b.upper_limit))
                  .reverse()[0].upper_limit,
                scores: {},
              };
            });
          });

        const students = await prisma.tbm_assessment_student.findMany({
          where: { assessment_id },
          select: {
            id: true,
            scores: {
              include: {
                assessment_type: { select: { code: true } },
              },
            },
          },
        });

        students.map((student, index) => {
          student.scores.reduce((acc, score) => {
            // (acc as any)[String(score?.assessment_type?.code) + score?.index] =
            //   score.score;

            grading.map((category) => {
              if (
                Number(score.score) >= Number(category.lower_limit) &&
                Number(score.score) <= Number(category.upper_limit)
              ) {
                if (
                  (category.scores as any)[
                    String(score?.assessment_type?.code) + score?.index
                  ]
                ) {
                  (category.scores as any)[
                    String(score?.assessment_type?.code) + score?.index
                  ]++;
                } else {
                  (category.scores as any)[
                    String(score?.assessment_type?.code) + score?.index
                  ] = 1;
                }
              }
            });

            return acc;
          }, {});
        });

        // calculate the avg
        grading.map((category) => {
          for (const key in category.scores) {
            (category as any).scores[key] = (
              ((category.scores as any)[key] / students.length) *
              100
            ).toFixed(2);
          }
        });

        // calculate the total avg to be displayed in the footer

        const footer = {
          avg: grading.reduce((acc, category) => {
            for (const key in category.scores) {
              if ((acc as any)[key]) {
                (acc as any)[key] += Number((category.scores as any)[key]);
              } else {
                (acc as any)[key] = Number((category.scores as any)[key]);
              }
            }

            for (const key in category.scores) {
              if ((acc as any)[key] >= 98) {
                (acc as any)[key] = 100;
              }
            }

            return acc;
          }, {}),
        };

        return {
          headers: [headers, headers2],
          items: grading,
          footer,
        };
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );
  }

  // =======================================================================================================================================================
  // Step 6. Student Proficiency Level Attainment for Each Assessment Tool
  // =======================================================================================================================================================

  async fetchProficiencyPerAssessmentTool(assessment_id: string) {
    return await prisma.$transaction(
      async (tx) => {
        const { headers, headers2 } = await this.generateTableHeader({
          assessment_id,
        });

        headers.push({
          key: "Avg",
          rowspan: 2,
          colspan: 1,
          background_color: Assessment.Colors.ProficiencyLevel,
        });

        const students = await prisma.tbm_assessment_student.findMany({
          where: { assessment_id },
          include: {
            student: {
              select: {
                nim: true,
                name: true,
              },
            },
            scores: {
              include: {
                assessment_type: {
                  select: {
                    code: true,
                    background_color: true,
                  },
                },
                proficiency_level_detail: {
                  select: {
                    level: true,
                  },
                },
              },
            },
            grading: {
              select: {
                grade: true,
              },
            },
            proficiency_level_detail: {
              select: {
                level: true,
              },
            },
          },
          orderBy: {
            student: {
              name: "asc",
            },
          },
        });

        const items = students.map((student, index) => {
          let total_score = 0;
          let count = 0;

          const proficiency_levels = student.scores.reduce((acc, score) => {
            total_score += score.proficiency_level_detail?.level || 0;
            count++;

            (acc as any)[String(score?.assessment_type?.code) + score?.index] =
              score.proficiency_level_detail?.level;
            return acc;
          }, {});

          return {
            id: student.id,
            no: index + 1,
            nim: student.student?.nim,
            name: student.student?.name,
            proficiency_levels,
            assessment_student_id: student.id,
            proficiency_level: student.proficiency_level_detail?.level,
            avg_proficiency_level: (total_score / count).toFixed(2),
            background_color: {
              proficiency_level: Assessment.Colors.ProficiencyLevel,
            },
          };
        });

        const total_proficiency = items.reduce((acc, item) => {
          for (const key in item.proficiency_levels) {
            if ((acc as any)[key]) {
              (acc as any)[key] += (item.proficiency_levels as any)[key];
            } else {
              (acc as any)[key] = (item.proficiency_levels as any)[key];
            }
          }

          return acc;
        }, {});

        const footer = {
          avg_proficiency_levels: Object.keys(total_proficiency).reduce(
            (acc, key) => {
              (acc as any)[key] = (
                (total_proficiency as any)[key] / items.length
              ).toFixed(2);
              return acc;
            },
            {}
          ),
          avg_proficiency_level: (
            items.reduce(
              (acc, item) => acc + Number(item.avg_proficiency_level),
              0
            ) / items.length
          ).toFixed(2),
        };

        return {
          headers: [headers, headers2],
          items,
          footer,
        };
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );
  }

  // =======================================================================================================================================================
  // Step 7. Percentage of Students within Each Proficiency Level
  // =======================================================================================================================================================

  async fetchPercentagePerProficiencyLevel(assessment_id: string) {
    return await prisma.$transaction(
      async (tx) => {
        // Parallelize independent database queries
        const [headerData, proficiencyLevelData, students] = await Promise.all([
          this.generateTableHeader({
            assessment_id,
            hide_student: true,
          }),
          tx.tbm_proficiency_level.findFirst({
            where: {
              is_deleted: false,
              assessments: { some: { id: assessment_id } },
            },
            include: {
              details: {
                orderBy: {
                  level: "desc",
                },
              },
            },
            orderBy: {
              level: "desc",
            },
          }),
          prisma.tbm_assessment_student.findMany({
            where: { assessment_id },
            select: {
              id: true,
              scores: {
                include: {
                  assessment_type: { select: { code: true } },
                  proficiency_level_detail: {
                    select: {
                      level: true,
                    },
                  },
                },
              },
            },
          }),
        ]);

        const { headers, headers2 } = headerData;
        headers.unshift({ key: "Proficiency Level", rowspan: 2, colspan: 1 });

        const proficiency_levels = proficiencyLevelData?.details.map(
          (level) => {
            return {
              ...level,
              scores: {},
            };
          }
        );

        if (!proficiency_levels)
          throw new Error("Proficiency levels not found");

        // Keeping your original calculation logic, just with more efficient structure
        students.forEach((student) => {
          student.scores.reduce((acc, score) => {
            proficiency_levels.forEach((level) => {
              if (score.proficiency_level_detail?.level == level.level) {
                const key = String(score?.assessment_type?.code) + score?.index;
                if ((level.scores as any)[key]) {
                  (level.scores as any)[key]++;
                } else {
                  (level.scores as any)[key] = 1;
                }
              }
            });

            return acc;
          }, {});
        });

        // Using your original calculation for averages
        proficiency_levels.forEach((level) => {
          for (const key in level.scores) {
            (level.scores as any)[key] = (
              ((level.scores as any)[key] / students.length) *
              100
            ).toFixed(2);
          }
        });

        // Keeping your exact footer calculation logic
        const footer = {
          avg: proficiency_levels.reduce((acc, level) => {
            for (const key in level.scores) {
              if ((acc as any)[key]) {
                (acc as any)[key] += Number((level.scores as any)[key]);
              } else {
                (acc as any)[key] = Number((level.scores as any)[key]);
              }
            }

            for (const key in level.scores) {
              if ((acc as any)[key] >= 98) {
                (acc as any)[key] = 100;
              }
            }

            return acc;
          }, {}),
        };

        return {
          headers: [headers, headers2],
          items: proficiency_levels,
          footer,
        };
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );
  }

  // =======================================================================================================================================================
  // Step 8. Attainment of Each Performance Indicator based on Step 2 & Step 7
  // =======================================================================================================================================================

  async fetchPerformanceIndicatorAttainment(assessment_id: string) {
    return await prisma.$transaction(
      async (tx) => {
        const indicators = await tx.tbm_course_assessment_plan
          .findMany({
            where: {
              course: { assessments: { some: { id: assessment_id } } },
            },
            include: {
              rubric: {
                select: {
                  code: true,
                  title: true,
                  student_outcome: {
                    select: { code: true },
                  },
                },
              },
            },
          })
          .then((indicators) => {
            return indicators.map((indicator) => ({
              ...indicator,
              percentage_by_categories: [],
              percentage_by_proficiency_levels: [],
            }));
          });

        const { items: percentagePerCategory } =
          await this.fetchPercentagePerCategory(assessment_id);
        const { items: percentageByProficiencyLevel } =
          await this.fetchPercentagePerProficiencyLevel(assessment_id);

        indicators.map((indicator) => {
          const keys: string[] = [];

          for (const key in indicator) {
            if (
              (key.startsWith("week") ||
                key === "mid_semester" ||
                key === "final_semester") &&
              (indicator as any)[key]
            ) {
              keys.push((indicator as any)[key]);
            }
          }

          // short key by name by using this getCharBeforeNumber function
          keys.sort((a, b) => {
            return this.getCharBeforeNumber(a).localeCompare(
              this.getCharBeforeNumber(b)
            );
          });

          // short by keys
          (indicator as any).headers = keys.map((key) => {
            return {
              key,
              rowspan: 2,
              colspan: 1,
            };
          });

          for (const category of percentagePerCategory) {
            const scores = getDataByKeys(category.scores, keys);
            const avg =
              Object.values(scores).reduce(
                (acc, score) => acc + Number(score),
                0
              ) / keys.length;

            (indicator as any).percentage_by_categories.push({
              ...category,
              scores: scores,
              avg: avg.toFixed(2),
            });
          }

          for (const proficiencyLevel of percentageByProficiencyLevel) {
            const scores = getDataByKeys(proficiencyLevel.scores, keys);
            const avg =
              Object.values(scores).reduce(
                (acc, score) => acc + Number(score),
                0
              ) / keys.length;

            (indicator as any).percentage_by_proficiency_levels.push({
              ...proficiencyLevel,
              scores: scores,
              avg: avg.toFixed(2),
            });
          }
        });

        return indicators;
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );
  }

  // =======================================================================================================================================================
  // Step 9. Summary of Course Assessment Results
  // =======================================================================================================================================================

  private transformDataChart(data: {
    title: string;
    items: { title: string; avg: Record<string, number> }[];
  }): (string | number)[][] {
    const keys = Array.from(
      new Set(data.items.flatMap((item) => Object.keys(item.avg)))
    );

    return [
      [data.title, ...data.items.map((item) => item.title)],
      ...keys.map((key) => [
        key,
        ...data.items.map((item) => item.avg[key] ?? 0),
      ]),
    ];
  }

  private processCategories(
    assessment: any,
    combinedCode: string,
    categoriesMap: Map<
      string,
      {
        title: string;
        lower_limit: number;
        upper_limit: number;
        avg: Record<string, number>;
      }
    >
  ) {
    if (!Array.isArray(assessment.percentage_by_categories)) return;

    assessment.percentage_by_categories.forEach((category: any) => {
      const categoryData = categoriesMap.get(category.title) ?? {
        title: category.title,
        lower_limit: category.lower_limit,
        upper_limit: category.upper_limit,
        avg: {},
      };

      if (category.avg !== undefined)
        (categoryData as any).avg[combinedCode] = parseFloat(category.avg);

      categoriesMap.set(category.title, categoryData);
    });
  }

  private processProficiencyLevels(
    assessment: any,
    combinedCode: string,
    performanceIndicatorMap: Map<
      string,
      { title: string; avg: Record<string, number> }
    >
  ) {
    if (!Array.isArray(assessment.percentage_by_proficiency_levels)) return;

    assessment.percentage_by_proficiency_levels.forEach(
      (proficiencyLevel: any) => {
        const proficiencyData = performanceIndicatorMap.get(
          proficiencyLevel.description
        ) ?? {
          title: `${proficiencyLevel.level}. ${proficiencyLevel.description}`,
          level: proficiencyLevel.level,
          avg: {},
        };

        if (proficiencyLevel.avg !== undefined)
          (proficiencyData as any).avg[combinedCode] = parseFloat(
            proficiencyLevel.avg
          );

        performanceIndicatorMap.set(
          proficiencyLevel.description,
          proficiencyData
        );
      }
    );
  }

  async fetchSummaryAssessmentResults(assessment_id: string) {
    const assessment = await this.fetchById(assessment_id);
    if (!assessment) throw new Error("Assessment not found");

    const performanceIndicatorAttainments =
      await this.fetchPerformanceIndicatorAttainment(assessment_id);

    const headers = performanceIndicatorAttainments.map((indicator) => ({
      key: `${indicator.rubric?.student_outcome?.code}-${indicator.rubric?.code}`,
      rowspan: 1,
      colspan: 1,
    }));

    const categoriesMap = new Map<
      string,
      {
        title: string;
        lower_limit: number;
        upper_limit: number;
        avg: Record<string, number>;
      }
    >();
    const performanceIndicatorMap = new Map<
      string,
      {
        title: string;
        level: number;
        avg: Record<string, number>;
      }
    >();

    performanceIndicatorAttainments.forEach((assessment) => {
      const combinedCode = `${assessment.rubric?.student_outcome?.code || ""}-${
        assessment.rubric?.code || ""
      }`;

      this.processCategories(assessment, combinedCode, categoriesMap);
      this.processProficiencyLevels(
        assessment,
        combinedCode,
        performanceIndicatorMap
      );
    });

    const avgPercentageByCategories = Array.from(categoriesMap.values());
    const avgPercentageByPerformanceIndicators = Array.from(
      performanceIndicatorMap.values()
    );

    const target_avg_percentage_by_categories =
      avgPercentageByCategories.filter(
        (category) =>
          category.lower_limit >= Number(assessment.target_attainment)
      );

    const target_avg_percentage_by_performance_indicators =
      avgPercentageByPerformanceIndicators.filter(
        (indicator) =>
          indicator.level >= Number(assessment.proficiency_level?.level)
      );

    return {
      headers,
      target_attainment: assessment.target_attainment,

      avg_percentage_by_categories: avgPercentageByCategories,
      avg_percentage_by_performance_indicators:
        avgPercentageByPerformanceIndicators,

      target_avg_percentage_by_categories,
      target_avg_percentage_by_performance_indicators,

      chart_percentage_by_categories: this.transformDataChart({
        title: "Category",
        items: avgPercentageByCategories,
      }),
      chart_target_avg_percentage_by_categories: this.transformDataChart({
        title: "Category",
        items: target_avg_percentage_by_categories,
      }),

      chart_percentage_by_performance_indicators: this.transformDataChart({
        title: "Performance Indicator",
        items: avgPercentageByPerformanceIndicators,
      }),
      chart_target_avg_percentage_by_performance_indicators:
        this.transformDataChart({
          title: "Performance Indicator",
          items: target_avg_percentage_by_performance_indicators,
        }),
    };
  }
}

export const AssessmentRepository = new Repository();
