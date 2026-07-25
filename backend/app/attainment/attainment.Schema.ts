export interface AssessmentData {
  id: string,
  semester: string,
  academic_year: string,
  class: string,
  lecturer: string,
  course: {
    code: string,
    title: string,
  },
  student_outcomes: Map<string, {
    description: string,
    rubrics: {
      code: string,
      title: string,
      binded_assessment_types: string[]
    }[]
  }>,
  scores: Map<string, number[]>
}

export type GradeObj = {
  excellent: number,
  very_good: number,
  good: number,
  fair: number,
  bad: number,
};

export type PerCourse = {
  id: string,
  code: string,
  title: string,
  lecturer: string,
  grade: GradeObj
}

export type PerRubrics = Map<string, {
  grade: GradeObj,
  title: string,
  bounded_courses_count: number,
  is_assessed: boolean,
  per_course: PerCourse[]
}>

export type PloAttainmentTemplate = Map<string, {
  grade: GradeObj,
  description: string,
  bounded_rubrics_count: number,
  is_assessed: boolean,
  per_rubrics: PerRubrics
}>;
