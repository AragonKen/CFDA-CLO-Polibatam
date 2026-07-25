import AttainmentRepository from "./attainment.Repository";
import { PloAttainmentTemplate, AssessmentData, GradeObj } from "./attainment.Schema";
import AttainmentCalculator from "./attainment.Calculator";
import { SEMESTER_TYPES } from "../../types";

const Grade_Keys: (keyof GradeObj)[] = ["excellent", "very_good", "good", "fair", "bad"] as const;

class Service {
  private plo_attainment_map_to_array(inputMap: PloAttainmentTemplate) {
    const result: any[] = [];

    for (const [key, value] of inputMap.entries()) {
      const perRubricsArr: any[] = [];

      const perRubrics = value?.per_rubrics;

      if (perRubrics instanceof Map) {
        for (const [rubricKey, rubricValue] of perRubrics.entries()) {
          perRubricsArr.push({
            code: rubricKey,
            grade: rubricValue?.grade,
            is_assessed: rubricValue?.is_assessed,
            bounded_courses_count: rubricValue?.bounded_courses_count,
            title: rubricValue?.title,
            per_course: rubricValue?.per_course
          });
        }
      }

      result.push({
        code: key,
        grade: value?.grade,
        is_assessed: value?.is_assessed,
        bounded_rubrics_count: value?.bounded_rubrics_count,
        description: value?.description,
        per_rubrics: perRubricsArr
      });
    }

    return result;
  }

  private calculate_assessment_grade(assessment: AssessmentData) {
    const result = new Map();

    // student_outcomes
    for (const [so_code, so] of assessment.student_outcomes) {
      result.set(so_code, new Map());
      for (const rubric of so.rubrics) {
        const rubric_grade = AttainmentCalculator.calculate_rubric_grade(assessment.scores, rubric.binded_assessment_types);
        if (!rubric_grade) continue;
        result.get(so_code).set(rubric.code, rubric_grade);
       }
    }

    return result;
  }

  async calculate_plo_attainment(study_program_id: string, academic_year: number, semester_type: SEMESTER_TYPES) {
    const assessment_datas = await AttainmentRepository.fetch_data(study_program_id, academic_year, semester_type);
    const plo_attainment_template = await AttainmentRepository.get_plo_attainment_template(study_program_id);

    // move data from clo to plo
    for (const data of assessment_datas) {
      const clo = this.calculate_assessment_grade(data);
      for (const [so_code, rubric_attainment] of clo) {
        for (const [rubric_code, rubric_grade] of rubric_attainment) {
          plo_attainment_template.get(so_code)!.per_rubrics.get(rubric_code)!.bounded_courses_count++;
          plo_attainment_template.get(so_code)!.per_rubrics.get(rubric_code)!.per_course.push({ id: data.id, code: data.course.code, title: data.course.title, lecturer:data.lecturer, grade: rubric_grade as GradeObj });
        }
      }
    }

    // calculate each rubric
    for (const [so_code, so_attainment] of plo_attainment_template) {
      for (const [rubric_code, rubric_attainment] of so_attainment.per_rubrics) {
        const bounded_course_count = rubric_attainment.bounded_courses_count;
        if (bounded_course_count < 1) continue;

        const temp_grade: GradeObj = {
          excellent: 0,
          very_good: 0,
          good: 0,
          fair: 0,
          bad: 0,
        }

        for (const grade_key of Grade_Keys) temp_grade[grade_key] = rubric_attainment.per_course.reduce((acc, cur) => (cur.grade[grade_key] + acc), 0);
        for (const grade_key of Grade_Keys) plo_attainment_template.get(so_code)!.per_rubrics.get(rubric_code)!.grade[grade_key] = temp_grade[grade_key] / bounded_course_count;

        rubric_attainment.is_assessed = true;
        plo_attainment_template.get(so_code)!.bounded_rubrics_count++;
      }

    }
    // calculate so
    for (const [so_code, so_attainment] of plo_attainment_template) {
      const bounded_rubrics_count = so_attainment.bounded_rubrics_count;
      if (bounded_rubrics_count < 1) continue;

      const temp_grade: GradeObj = {
        excellent: 0,
        very_good: 0,
        good: 0,
        fair: 0,
        bad: 0,
      }

      for (const [_, rubric_attainment] of so_attainment.per_rubrics) {
        if (!rubric_attainment.is_assessed) continue;
        for (const grade_key of Grade_Keys) temp_grade[grade_key] += rubric_attainment.grade[grade_key];
      }

      for (const grade_key of Grade_Keys) plo_attainment_template.get(so_code)!.grade[grade_key] = temp_grade[grade_key] / bounded_rubrics_count;

      so_attainment.is_assessed = true;
    }

    return this.plo_attainment_map_to_array(plo_attainment_template);
  }
}

const AttainmentService = new Service();

export default AttainmentService;
