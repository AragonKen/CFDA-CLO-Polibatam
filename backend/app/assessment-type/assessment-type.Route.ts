import { Router } from "express";
import { AssessmentTypeController } from "./assessment-type.Controller";

export const AssessmentTypeRoute = Router().get(
  "/",
  AssessmentTypeController.get
);
