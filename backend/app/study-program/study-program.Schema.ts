import { z } from "zod";

export const StudyProgramSchema = z.object({
  department_id: z.string().min(1, "Jurusan is required"),
  code: z.string().min(1, "Code must be at least 1 character"),
  title: z.string().min(1, "Title is required"),
});

const SEMESTER_TYPES = ["ganjil", "genap"] as const;

export const PloAttainmentQuerySchema = z.object({
  academic_year: z.coerce
    .number({
      required_error: "academic_year is required",
      invalid_type_error: "academic_year must be a number",
    })
    .int(),

  semester_type: z
    .string({
      required_error: "semester_type is required",
    })
    .min(1, "semester_type is required")
    .refine(
      (value): value is (typeof SEMESTER_TYPES)[number] =>
        SEMESTER_TYPES.includes(value as any),
      {
        message: "semester_type must be 'ganjil' or 'genap'",
      }
    ),
});

export type StudyProgramSchema = z.infer<typeof StudyProgramSchema>;
