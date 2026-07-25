import { Router } from "express";
import { GradingController } from "./grading.Controller";

export const GradingRoute = Router().get("/", GradingController.get);
