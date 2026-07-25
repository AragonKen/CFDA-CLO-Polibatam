import { z } from "zod";

export const AssessmentMethodSchema = z.object({
  title: z.string().min(1, "Title must be at least 1 character long"),
});

export type AssessmentMethodSchema = z.infer<typeof AssessmentMethodSchema>;
