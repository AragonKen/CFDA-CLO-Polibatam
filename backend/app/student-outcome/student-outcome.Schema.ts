import { z } from "zod";

export const StudentOutcomeSchema = z.object({
  description: z.string().min(1, "Student Outcome is required"),
  study_program_id: z.string().min(1, "Study Program is required"),
});

export type StudentOutcomeSchema = z.infer<typeof StudentOutcomeSchema>;

export const StudentOutcomeBulkSchema = z.object({
  data: z.array(
    z.object({
      code: z.string().optional(),
      description: z.string().min(1, "Student Outcome is required"),
    })
  ),
  study_program_id: z.string().min(1, "Study Program is required"),
});

export type StudentOutcomeBulkSchema = z.infer<typeof StudentOutcomeBulkSchema>;
