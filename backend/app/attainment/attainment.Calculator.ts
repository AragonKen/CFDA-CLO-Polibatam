import { GradeObj } from "./attainment.Schema";

export default class AttainmentCalculator {
  static calculate_scores_grade(scores: number[]): GradeObj {
    const result = {
      excellent: 0,
      very_good: 0,
      good: 0,
      fair: 0,
      bad: 0
    };

    const counter = {
      excellent: 0,
      very_good: 0,
      good: 0,
      fair: 0,
      bad: 0
    };

    for (const score of scores) {
      if (score >= 85) {
        counter["excellent"] += 1;
      } else if (score >= 75) {
        counter["very_good"] += 1;
      } else if (score >= 65) {
        counter["good"] += 1;
      } else if (score >= 55) {
        counter["fair"] += 1;
      } else {
        counter["bad"] += 1;
      }
    }

    result.excellent = counter.excellent / scores.length || 0;
    result.very_good = counter.very_good / scores.length || 0;
    result.good = counter.good / scores.length || 0;
    result.fair = counter.fair / scores.length || 0;
    result.bad = counter.bad / scores.length || 0;

    return result;
  }

  static calculate_rubric_grade(scores: Map<string, number[]>, binded_assessment_types: string[]): GradeObj | undefined {
    if (binded_assessment_types.length < 1) return;
    const result = {
      excellent: 0,
      very_good: 0,
      good: 0,
      fair: 0,
      bad: 0
    };

    for (const assessment_type of binded_assessment_types) {
      const assessment_grade = this.calculate_scores_grade(scores.get(assessment_type) || []);
      result.excellent += assessment_grade.excellent;
      result.very_good += assessment_grade.very_good;
      result.good += assessment_grade.good;
      result.fair += assessment_grade.fair;
      result.bad += assessment_grade.bad;
    }

    result.excellent /= binded_assessment_types.length;
    result.very_good /= binded_assessment_types.length;
    result.good /= binded_assessment_types.length;
    result.fair /= binded_assessment_types.length;
    result.bad /= binded_assessment_types.length;

    return result;
  }
}
