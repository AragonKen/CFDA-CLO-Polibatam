import { Request  } from "express";

export const get_user_department = (user: Request["user"]) : string | null => {
  return user?.department_id ?? null;
}
