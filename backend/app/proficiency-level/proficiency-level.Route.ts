import { Router } from "express";
import { AssessmentMethodController } from "./proficiency-level.Controller";
import { ProficiencyLevelMiddleware } from "./proficiency-level.Middleware";

export const ProficiencyLevelRoute = Router()
  .get("/detail/:id", AssessmentMethodController.getProficiencyLevelDetailByID)
  .put(
    "/detail/:id",
    ProficiencyLevelMiddleware.schemaDetail,
    AssessmentMethodController.updateProficiencyLevelDetailByID
  )

  .get("/", AssessmentMethodController.get)
  .get("/:id", AssessmentMethodController.getByID);
