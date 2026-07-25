import { z } from "zod";

export const AssessmentSchema = z.object({
  semester: z.string().min(1, "Semester is required"),
  academic_year: z.string().min(1, "Academic year is required"),
  class: z.string().min(1, "Class is required"),
  target_attainment: z.coerce.number().min(1, "Target attainment is required"),

  teacher_nip: z.string().min(1, "Teacher NIP is required"),
  course_id: z.string().min(1, "Course ID is required"),
  proficiency_level_id: z.string().min(1, "Proficiency level ID is required"),
});

export type AssessmentSchema = z.infer<typeof AssessmentSchema>;

export const AssessmentGradeSchema = z.object({
  nim: z.string().min(1, "NIM is required"),
  name: z.string().min(1, "Name is required"),

  scores: z.array(
    z.object({
      key: z.string().optional().default(""),
      value: z.coerce.number().optional().default(0),
    })
  ),
});

export type AssessmentGradeSchema = z.infer<typeof AssessmentGradeSchema>;

export const AssessmentGradeBulkSchema = z.array(AssessmentGradeSchema);
export type AssessmentGradeBulkSchema = z.infer<
  typeof AssessmentGradeBulkSchema
>;
