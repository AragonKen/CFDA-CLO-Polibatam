import { z } from "zod";

export const CourseLearningOutcomeSchema = z.object({
  code: z.string().min(1, "Code must be at least 1 character long"),
  title: z.string().min(1, "Title must be at least 1 character long"),
  description: z.string().optional().default(""),

  course_id: z.string().min(1, "Course is required"),
  assessment_method_id: z.string().min(1, "Assessment Method is required"),

  rubrics: z.array(z.string().min(1, "Rubric is required")).default([]),
});

export type CourseLearningOutcomeSchema = z.infer<
  typeof CourseLearningOutcomeSchema
>;
