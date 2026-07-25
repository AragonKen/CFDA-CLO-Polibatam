import { PrismaClient } from "@prisma/client";

const ASSESSMENT_TYPES = [
  {
    code: "A",
    title: "Assignment",
    background_color: "#bcd7ed",
  },
  {
    code: "P",
    title: "Practice or Project",
    background_color: "#c5e0b3",
  },
  {
    code: "Q",
    title: "Quiz",
    background_color: "#ffe597",
  },
  {
    code: "MSE",
    title: "Mid-Semester Exam",
    background_color: "#f7c9ac",
  },
  {
    code: "FSE",
    title: "Final-Semester Exam",
    background_color: "#f7c9ac",
  },
  {
    code: "PP",
    title: "Project Presentation",
    background_color: "#d0cece",
  },
];

export async function AssessmentTypeSeeder(prisma: PrismaClient) {
  for (const assessmentType of ASSESSMENT_TYPES) {
    const exist = await prisma.tbm_assessment_type.findFirst({
      where: {
        code: assessmentType.code,
      },
    });

    if (exist) {
      await prisma.tbm_assessment_type.updateMany({
        where: {
          code: assessmentType.code,
        },
        data: {
          title: assessmentType.title,
          background_color: assessmentType.background_color,
        },
      });
    } else {
      await prisma.tbm_assessment_type.create({
        data: {
          code: assessmentType.code,
          title: assessmentType.title,
          background_color: assessmentType.background_color,
        },
      });
    }
  }

  console.log("Assessment Types seeded successfully", {
    tbm_assessment_type: await prisma.tbm_assessment_type.count(),
  });
}
