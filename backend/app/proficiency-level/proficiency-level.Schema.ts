import { z } from "zod";

export const ProficiencyLevelDetailSchema = z.object({
  description: z.string().min(1, "Description is required"),
  lower_limit: z.coerce
    .number()
    .int()
    .min(0, "Lower limit must be greater than or equal to 0")
    .max(100, "Lower limit must be less than or equal to 100"),
  upper_limit: z.coerce
    .number()
    .int()
    .min(0, "Upper limit must be greater than or equal to 0")
    .max(100, "Upper limit must be less than or equal to 100"),
});

export type ProficiencyLevelDetailSchema = z.infer<
  typeof ProficiencyLevelDetailSchema
>;
