import { z } from "zod";

export const CourseAssessmentPlanSchema = z.object({
  week1: z.string().optional().nullable().default(""),
  week2: z.string().optional().nullable().default(""),
  week3: z.string().optional().nullable().default(""),
  week4: z.string().optional().nullable().default(""),
  week5: z.string().optional().nullable().default(""),
  week6: z.string().optional().nullable().default(""),
  week7: z.string().optional().nullable().default(""),
  week8: z.string().optional().nullable().default(""),
  week9: z.string().optional().nullable().default(""),
  week10: z.string().optional().nullable().default(""),
  week11: z.string().optional().nullable().default(""),
  week12: z.string().optional().nullable().default(""),
  week13: z.string().optional().nullable().default(""),
  week14: z.string().optional().nullable().default(""),
  mid_semester: z.string().optional().nullable().default(""),
  final_semester: z.string().optional().nullable().default(""),

  course_id: z.string().min(1, "Course ID is required"),
  rubric_id: z.string().min(1, "Rubric ID is required"),
});

export type CourseAssessmentPlanSchema = z.infer<
  typeof CourseAssessmentPlanSchema
>;
