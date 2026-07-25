import { PrismaClient, tbm_user } from "@prisma/client";
const prisma = new PrismaClient();

import { GradingSeeder } from "./seeders/grading.seed";
import { AssessmentTypeSeeder } from "./seeders/assessment-type.seed";
import { ProficiencyLevelSeeder } from "./seeders/proficiency-level.seed";
import { AssessmentMethodSeeder } from "./seeders/assessment-method.seed";
import { DepartmentAndStudyProgramSeeder } from "./seeders/department-and-study-program.seed";
import { RoleAndPermissionSeeder } from "./seeders/role-and-permission.seed";

async function main() {
  try {
    await GradingSeeder(prisma);
    await AssessmentTypeSeeder(prisma);
    await ProficiencyLevelSeeder(prisma);
    await AssessmentMethodSeeder(prisma);
    await DepartmentAndStudyProgramSeeder(prisma);
    await RoleAndPermissionSeeder(prisma);
  } catch (error) {
    console.log(error);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
