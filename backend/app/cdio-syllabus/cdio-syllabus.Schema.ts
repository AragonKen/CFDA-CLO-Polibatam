import { z } from "zod";

export const CDIOSyllabusParentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  study_program_id: z.string().min(1, "Study Program is required"),
});

export type CDIOSyllabusParentSchema = z.infer<typeof CDIOSyllabusParentSchema>;

export const CDIOSyllabusSchema = z.object({
  title: z.string().min(1, "Title is required"),

  parent_id: z.string().min(1, "CDIO Syllabus is required"),
  study_program_id: z.string().min(1, "Study Program is required"),
});

export type CDIOSyllabusSchema = z.infer<typeof CDIOSyllabusSchema>;

export const CDIOSyllabusBulkSchema = z.object({
  study_program_id: z.string().min(1, "Study Program is required"),
  data: z.array(
    z.object({
      code: z.coerce.number({ message: "Code must be a number" }),
      description: z.string().min(1, "Description is required"),
      children: z.array(
        z.object({
          code: z.coerce.number({ message: "Code must be a number" }),
          description: z.string().min(1, "Description is required"),
        })
      ),
    })
  ),
});

export type CDIOSyllabusBulkSchema = z.infer<typeof CDIOSyllabusBulkSchema>;
