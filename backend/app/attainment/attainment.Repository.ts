import prisma from "../../lib/prisma.service";
import { SEMESTER_TYPES } from "../../types";
import { AssessmentData, PloAttainmentTemplate } from "./attainment.Schema";

class Repository {
  async fetch_data(study_program_id: string, academic_year: number, semester_type: SEMESTER_TYPES): Promise<AssessmentData[]> {
    const students_scores_query = {
      select: {
        scores: {
          select: {
            index: true,
            score: true,
            assessment_type: {
              select: {
                code: true
              }
            }
          }
        },
      },
    };

    const semester_type_to_strings = {
      ganjil: ["1", "3", "5", "7"],
      genap:  ["2", "4", "6", "8"]
    }

    const assessment_with_scores = await prisma.tbm_assessment.findMany({
      select: {
        id: true,
        semester: true,
        academic_year: true,
        class: true,
        teacher: true,
        course: {
          select: {
            id: true,
            code: true,
            title: true,
            assessment_plans: {
              select: {
                week1: true,
                week2: true,
                week3: true,
                week4: true,
                week5: true,
                week6: true,
                week7: true,
                week8: true,
                week9: true,
                week10: true,
                week11: true,
                week12: true,
                week13: true,
                week14: true,
                mid_semester: true,
                final_semester: true,
                rubric: {
                  select: {
                    title: true,
                    code: true,
                    student_outcome: {
                      select: {
                        code: true,
                        description: true
                      }
                    }
                  }
                }
              }
            }
          },
        },
        students: students_scores_query,
        _count: {
          select: {
            students: true,
          }
        }
      },
      where: {
        is_deleted: false,
        academic_year: {
          startsWith: String(academic_year)
        },
        OR: [
          { semester: { in: semester_type_to_strings[semester_type] } },
          { semester: semester_type }
        ],
        course: {
          study_program: {
            id: study_program_id
          }
        }
      }
    }).then(data => (
      data
        .filter(assessment => assessment._count.students > 0)
        .map(assessment => ({
          id: assessment.id!,
          semester: assessment.semester!,
          academic_year: assessment.academic_year!,
          class: assessment.class!,
          lecturer: assessment.teacher!.name,
          course: {
            code: assessment.course!.code!,
            title: assessment.course!.title!,
          },
          student_outcomes: (() => {
            const result: Map<string, {
              description: string,
              rubrics: {
                code: string,
                title: string,
                binded_assessment_types: string[]
              }[]
            }> = new Map();

            for (const plan of assessment.course!.assessment_plans) {
              const current_so_code = plan.rubric!.student_outcome.code!;
              if (!result.get(current_so_code)) result.set(current_so_code, {
                description: plan.rubric!.student_outcome.description || "",
                rubrics: []
              });

              const binded_assessment_type: string[] = [];

              for (const key in plan) {
                // typescript complains if we try to dynamically get the value using key
                // so we need to convert the key type from string to "key of object 'plan'"
                const typedKey = key as keyof typeof plan;

                if ((key.startsWith("week") || key === "mid_semester" || key === "final_semester") && plan[typedKey] !== "" && plan[typedKey]) {
                  binded_assessment_type.push(plan[typedKey] as string);
                }
              }

              result.get(current_so_code)?.rubrics.push({
                code: plan.rubric!.code || "",
                title: plan.rubric!.title || "",
                binded_assessment_types: binded_assessment_type
              });
            }

            return result;
          })(),
          scores: (() => {
            const result: Map<string, number[]> = new Map();

            for (const student of assessment.students) {
              for (const score of student.scores) {
                const current_key = `${score.assessment_type?.code}${score.index}`;
                if (!result.get(current_key)) result.set(current_key, []);
                result.get(current_key)!.push(score.score || 0);
              }
            }

            return result;
          })()
      }))
    ));

    return assessment_with_scores;
  }

  async get_plo_attainment_template(study_program_id: string): Promise<PloAttainmentTemplate> {
    const data: PloAttainmentTemplate = await prisma.tbm_student_outcome.findMany({
      select: {
        code: true,
        description: true,
        rubric: {
          select: {
            code: true,
            title: true
          },
          where: {
            is_deleted: false
          },
          orderBy: {
            code: "asc"
          }
        },
      },
      where: {
        study_program: {
          id: study_program_id
        },
        is_deleted: false,
      },
      orderBy: {
        code: "asc"
      }
    }).then(outcomes => {
      const template: PloAttainmentTemplate = new Map();

      for (const so of outcomes) {
        template.set(so.code!, {
          grade: {
            excellent: 0,
            very_good: 0,
            good: 0,
            fair: 0,
            bad: 0,
          },
          description: so.description!,
          bounded_rubrics_count: 0,
          is_assessed: false,
          per_rubrics: new Map()
        });

        for (const rubric of so.rubric) {
          template.get(so.code!)!.per_rubrics.set(rubric.code!, {
            grade: {
              excellent: 0,
              very_good: 0,
              good: 0,
              fair: 0,
              bad: 0,
            },
            title: rubric.title!,
            bounded_courses_count: 0,
            is_assessed: false,
            per_course: []
          });
        }
      }

      return template;
    });

    return data;
  }
}

const AttainmentRepository = new Repository();

export default AttainmentRepository;
