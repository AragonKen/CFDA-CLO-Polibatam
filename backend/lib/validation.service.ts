import { ZodError, ZodType } from "zod";

class Service {
  validate(schema: any, data: any) {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        console.log("error", error.issues[0]);

        throw new Error(error.issues.map((err) => err.message).join(", "));
      }

      throw new Error("Failed to validate data");
    }
  }
}

export const ValidationService = new Service();
