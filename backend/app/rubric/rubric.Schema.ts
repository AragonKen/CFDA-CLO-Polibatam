import { z } from "zod";

export const RubricSchema = z.object({
  code: z.string().min(1, "Code is required"),
  title: z.string().min(1, "Title is required"),

  description_level_1: z.coerce.string().default(""),
  description_level_2: z.coerce.string().default(""),
  description_level_3: z.coerce.string().default(""),
  description_level_4: z.coerce.string().default(""),
  description_level_5: z.coerce.string().default(""),

  study_program_id: z.string().min(1, "Study Program is required"),
  student_outcome_id: z.string().min(1, "Student Outcome is required"),
  cdio_syllabus_id: z.string().min(1, "CDIO Syllabus is required"),
});

export const RubricBulkCreateSchema = z
  .array(
    z.object({
      code: z.string().min(1, "Code is required"),
      title: z.string().min(1, "Title is required"),

      description_level_1: z.coerce.string().default(""),
      description_level_2: z.coerce.string().default(""),
      description_level_3: z.coerce.string().default(""),
      description_level_4: z.coerce.string().default(""),
      description_level_5: z.coerce.string().default(""),

      study_program_id: z.string().min(1, "Study Program is required"),
      student_outcome_code: z.string().min(1, "Student Outcome is required"),
      cdio_syllabus_level: z.coerce
        .number()
        .min(1, "CDIO Syllabus is required"),
    })
  )
  .min(1, "Rubric is required");

export type RubricSchema = z.infer<typeof RubricSchema>;
export type RubricBulkCreateSchema = z.infer<typeof RubricBulkCreateSchema>;
