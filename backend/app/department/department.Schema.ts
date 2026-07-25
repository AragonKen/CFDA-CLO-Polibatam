import { z } from "zod";

export const DepartmentSchema = z.object({
  code: z.string().min(1, "Code must be at least 1 character"),
  title: z.string().min(1, "Title is required"),
});

export type DepartmentSchema = z.infer<typeof DepartmentSchema>;
