import { PrismaClient } from "@prisma/client";

const LEVEL = {
  0: "Not Observed",
  1: "to have experienced or been exposed to",
  2: "to be able to participate in and contribute to",
  3: "to be able to understand and explain",
  4: "to be skilled in the practice or implementation of",
  5: "to be able to lead or innovate in",
};

const DATA = [
  {
    level: 1,
    description: LEVEL[1],
    details: [
      {
        level: 1,
        description: LEVEL[1],
        lower_limit: 1,
        upper_limit: 100,
      },
      {
        level: 0,
        description: LEVEL[0],
        lower_limit: 0,
        upper_limit: 0,
      },
    ],
  },
  {
    level: 2,
    description: LEVEL[2],
    details: [
      {
        level: 2,
        description: LEVEL[2],
        lower_limit: 51,
        upper_limit: 100,
      },
      {
        level: 1,
        description: LEVEL[1],
        lower_limit: 1,
        upper_limit: 50,
      },
      {
        level: 0,
        description: LEVEL[0],
        lower_limit: 0,
        upper_limit: 0,
      },
    ],
  },
  {
    level: 3,
    description: LEVEL[3],
    details: [
      {
        level: 3,
        description: LEVEL[3],
        lower_limit: 80,
        upper_limit: 100,
      },
      {
        level: 2,
        description: LEVEL[2],
        lower_limit: 50,
        upper_limit: 79,
      },
      {
        level: 1,
        description: LEVEL[1],
        lower_limit: 1,
        upper_limit: 49,
      },
      {
        level: 0,
        description: LEVEL[0],
        lower_limit: 0,
        upper_limit: 0,
      },
    ],
  },
  {
    level: 4,
    description: LEVEL[4],
    details: [
      {
        level: 4,
        description: LEVEL[4],
        lower_limit: 86,
        upper_limit: 100,
      },
      {
        level: 3,
        description: LEVEL[3],
        lower_limit: 51,
        upper_limit: 85,
      },
      {
        level: 2,
        description: LEVEL[2],
        lower_limit: 26,
        upper_limit: 50,
      },
      {
        level: 1,
        description: LEVEL[1],
        lower_limit: 1,
        upper_limit: 25,
      },
      {
        level: 0,
        description: LEVEL[0],
        lower_limit: 0,
        upper_limit: 0,
      },
    ],
  },
  {
    level: 5,
    description: LEVEL[5],
    details: [
      {
        level: 5,
        description: LEVEL[5],
        lower_limit: 81,
        upper_limit: 100,
      },
      {
        level: 4,
        description: LEVEL[4],
        lower_limit: 61,
        upper_limit: 80,
      },
      {
        level: 3,
        description: LEVEL[3],
        lower_limit: 41,
        upper_limit: 60,
      },
      {
        level: 2,
        description: LEVEL[2],
        lower_limit: 21,
        upper_limit: 40,
      },
      {
        level: 1,
        description: LEVEL[1],
        lower_limit: 1,
        upper_limit: 20,
      },
      {
        level: 0,
        description: LEVEL[0],
        lower_limit: 0,
        upper_limit: 0,
      },
    ],
  },
];

export async function ProficiencyLevelSeeder(prisma: PrismaClient) {
  await Promise.all(
    DATA.map(async (level) => {
      // Check for existing proficiency level
      let proficiencyLevel = await prisma.tbm_proficiency_level.findFirst({
        where: { level: level.level },
      });

      // Create or update proficiency level
      if (!proficiencyLevel) {
        proficiencyLevel = await prisma.tbm_proficiency_level.create({
          data: {
            level: level.level,
            description: level.description,
          },
        });
      } else {
        proficiencyLevel = await prisma.tbm_proficiency_level.update({
          where: { id: proficiencyLevel.id },
          data: {
            level: level.level,
            description: level.description,
          },
        });
      }

      // Process level details
      await Promise.all(
        level.details.map(async (detail) => {
          // Check for existing detail
          const existingDetail =
            await prisma.tbm_proficiency_level_detail.findFirst({
              where: {
                level: detail.level,
                proficiency_level_id: proficiencyLevel.id,
              },
            });

          // Create or update detail
          if (!existingDetail) {
            await prisma.tbm_proficiency_level_detail.create({
              data: {
                level: detail.level,
                description: detail.description,
                lower_limit: detail.lower_limit,
                upper_limit: detail.upper_limit,
                proficiency_level_id: proficiencyLevel.id,
              },
            });
          } else {
            await prisma.tbm_proficiency_level_detail.update({
              where: { id: existingDetail.id },
              data: {
                level: detail.level,
                description: detail.description,
                lower_limit: detail.lower_limit,
                upper_limit: detail.upper_limit,
              },
            });
          }
        })
      );
    })
  );

  console.log("Proficiency Level seeder done.", {
    tbm_proficiency_level: await prisma.tbm_proficiency_level.count(),
    tbm_proficiency_level_detail:
      await prisma.tbm_proficiency_level_detail.count(),
  });
}
