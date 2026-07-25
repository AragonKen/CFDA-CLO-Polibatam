import { PrismaClient } from "@prisma/client";

const GRADING = [
  {
    title: "Excellent",
    grading: [{ lower_limit: 86, upper_limit: 100, grade: "A" }],
  },
  {
    title: "Very Good",
    grading: [
      { lower_limit: 80, upper_limit: 85, grade: "A-" },
      { lower_limit: 75, upper_limit: 79, grade: "B+" },
    ],
  },
  {
    title: "Good",
    grading: [
      { lower_limit: 70, upper_limit: 74, grade: "B" },
      { lower_limit: 65, upper_limit: 69, grade: "B-" },
    ],
  },
  {
    title: "Fair",
    grading: [
      { lower_limit: 60, upper_limit: 64, grade: "C+" },
      { lower_limit: 55, upper_limit: 59, grade: "C" },
    ],
  },
  {
    title: "Poor",
    grading: [
      { lower_limit: 50, upper_limit: 54, grade: "C-" },
      { lower_limit: 45, upper_limit: 49, grade: "D+" },
      { lower_limit: 40, upper_limit: 44, grade: "D" },
      { lower_limit: 0, upper_limit: 39, grade: "E" },
    ],
  },
];

export async function GradingSeeder(prisma: PrismaClient) {
  for (const category of GRADING) {
    // Find or create the grading category
    const gradingCategory =
      (await prisma.tbm_grading_category.findFirst({
        where: { title: category.title },
      })) ||
      (await prisma.tbm_grading_category.create({
        data: { title: category.title },
      }));

    // Process each grading entry in the category
    for (const grading of category.grading) {
      const exists = await prisma.tbm_grading.findFirst({
        where: {
          lower_limit: grading.lower_limit,
          upper_limit: grading.upper_limit,
          grade: grading.grade,
          category_id: gradingCategory.id,
        },
      });

      if (!exists) {
        await prisma.tbm_grading.create({
          data: {
            lower_limit: grading.lower_limit,
            upper_limit: grading.upper_limit,
            grade: grading.grade,
            category_id: gradingCategory.id,
          },
        });
      }
    }
  }

  // Log seeder success
  const gradingCategoryCount = await prisma.tbm_grading_category.count();
  const gradingCount = await prisma.tbm_grading.count();
  console.log("Grading seeder success", {
    tbm_grading_category: gradingCategoryCount,
    tbm_grading: gradingCount,
  });
}
