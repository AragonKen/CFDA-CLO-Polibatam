import { z } from "zod";

export const CourseSchema = z.object({
  code: z.string().min(1, "Code must be at least 1 character long"),
  title: z.string().min(1, "Title must be at least 1 character long"),
  credit: z.coerce.number().int().min(1, "Credit is required"),

  study_program_id: z.string().min(1, "Study program is required"),

  assessment_types: z
    .array(
      z.object({
        weight: z.coerce.number().int().min(1, "Weight is required"),
        quantity: z.coerce.number().int().min(1, "Quantity is required"),
        assessment_type_id: z.string().min(1, "Assessment type is required"),
      })
    )
    .min(1, "Assessment types are required"),
});

export type CourseSchema = z.infer<typeof CourseSchema>;
