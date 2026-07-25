import { PrismaClient } from "@prisma/client";

const DATA = [
  {
    title: "Written and oral question",
  },
  {
    title: "Performance ratings",
  },
  {
    title: "Product reviews",
  },
  {
    title: "Journal and portfolios",
  },
  {
    title: "Self-report instruments",
  },
];

export async function AssessmentMethodSeeder(prisma: PrismaClient) {
  for (const assessmentMethod of DATA) {
    const exist = await prisma.tbm_assessment_method.findFirst({
      where: {
        title: assessmentMethod.title,
      },
    });

    if (!exist) {
      await prisma.tbm_assessment_method.create({
        data: {
          title: assessmentMethod.title,
        },
      });
    } else {
      await prisma.tbm_assessment_method.update({
        where: {
          id: exist.id,
        },
        data: {
          title: assessmentMethod.title,
        },
      });
    }
  }

  console.log("Assessment Method seeder done.", {
    tbm_assessment_method: await prisma.tbm_assessment_method.count(),
  });
}
