import { Router } from "express";

import { UserRoute } from "../app/user/user.Route";
import { GradingRoute } from "../app/grading/grading.Route";
import { AssessmentTypeRoute } from "../app/assessment-type/assessment-type.Route";
import { AssessmentMethodRoute } from "../app/assessment-method/assessment-method.Route";
import { ProficiencyLevelRoute } from "../app/proficiency-level/proficiency-level.Route";
import { DepartmentRoute } from "../app/department/department.Route";
import { StudyProgramRoute } from "../app/study-program/study-program.Route";
import { CDIOSyllabusRoute } from "../app/cdio-syllabus/cdio-syllabus.Route";
import { StudentOutcomeRoute } from "../app/student-outcome/student-outcome.Route";
import { RubricRoute } from "../app/rubric/rubric.Route";
import { CourseRoute } from "../app/course/course.Route";
import { CourseLearningOutcomeRoute } from "../app/course-learning-outcome/course-learning-outcome.Route";
import { CourseAssessmentPlanRoute } from "../app/course-assessment-plan/course-assessment-plan.Route";
import { AssessmentRoute } from "../app/assessment/assessment.Route";
import { AiRoute } from "../app/ai/ai.Route";
import { RoleRoute } from "../app/role/role.Route";

const ProtectedRoutes = Router()
  .use("/assessment", AssessmentRoute)

  .use("/course", CourseRoute)
  .use("/course-learning-outcome", CourseLearningOutcomeRoute)
  .use("/course-assessment-plan", CourseAssessmentPlanRoute)

  .use("/rubric", RubricRoute)
  .use("/cdio-syllabus", CDIOSyllabusRoute)
  .use("/student-outcome", StudentOutcomeRoute)

  .use("/study-program", StudyProgramRoute)
  .use("/department", DepartmentRoute)

  // Utilities
  .use("/assessment-method", AssessmentMethodRoute)
  .use("/proficiency-level", ProficiencyLevelRoute)
  .use("/assessment-type", AssessmentTypeRoute)
  .use("/grading", GradingRoute)
  .use("/user", UserRoute)
  .use("/role", RoleRoute)

  .use("/ai", AiRoute)

export default ProtectedRoutes;
