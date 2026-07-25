import { z } from "zod";
import { ENV } from "../../constants";

export const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password:
    ENV.NODE_ENV === "development"
      ? z.string().optional()
      : z.string().min(1, "Password is required"),
});

export type LoginSchema = z.infer<typeof LoginSchema>;
