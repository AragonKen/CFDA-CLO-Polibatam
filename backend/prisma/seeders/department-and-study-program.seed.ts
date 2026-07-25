import { PrismaClient } from "@prisma/client";

const DATA = [
  {
    title: "Manajemen Bisnis",
    code: "MB",
    study_programs: [
      { title: "Diploma 3 Akuntansi", code: "MB-D3A" },
      { title: "Sarjana Terapan Akuntansi Manajerial", code: "MB-STAM" },
      {
        title: "Sarjana Terapan Administrasi Bisnis Terapan",
        code: "MB-STABT",
      },
      {
        title: "Sarjana Terapan Logistik Perdagangan Internasional",
        code: "MB-STLPI",
      },
      {
        title:
          "Sarjana Terapan Administrasi Bisnis Terapan (International Class)",
        code: "MB-STABTIC",
      },
      {
        title: "Program Studi D2 Jalur Cepat Distribusi Barang",
        code: "MB-D2JCDB",
      },
    ],
  },
  {
    title: "Teknik Elektro",
    code: "TE",
    study_programs: [
      { title: "Diploma 3 Teknik Elektronika Manufaktur", code: "TE-D3TEM" },
      {
        title: "Sarjana Terapan Teknologi Rekayasa Elektronika",
        code: "TE-STTRE",
      },
      { title: "Diploma 3 Teknik Instrumentasi", code: "TE-D3TI" },
      { title: "Sarjana Terapan Teknik Mekatronika", code: "TE-STTM" },
      {
        title: "Sarjana Terapan Teknologi Rekayasa Pembangkit Energi",
        code: "TE-STTRPE",
      },
      { title: "Sarjana Terapan Teknik Robotika", code: "TE-STTR" },
    ],
  },
  {
    title: "Teknik Informatika",
    code: "IF",
    study_programs: [
      { title: "Diploma 3 Teknik Informatika", code: "IF-D3TI" },
      { title: "Diploma 3 Teknologi Geomatika", code: "IF-D3TG" },
      { title: "Sarjana Terapan Animasi", code: "IF-STA" },
      {
        title: "Sarjana Terapan Teknologi Rekayasa Multimedia",
        code: "IF-STTRM",
      },
      { title: "Sarjana Terapan Rekayasa Keamanan Siber", code: "IF-STRKS" },
      { title: "Sarjana Terapan Rekayasa Perangkat Lunak", code: "IF-STRPL" },
    ],
  },
  {
    title: "Teknik Mesin",
    code: "ME",
    study_programs: [
      { title: "Diploma 3 Teknik Mesin", code: "ME-D3TM" },
      { title: "Diploma 3 Teknik Perawatan Pesawat Udara", code: "ME-D3TPPU" },
      {
        title: "Sarjana Terapan Teknologi Rekayasa Konstruksi Perkapalan",
        code: "ME-STTRKP",
      },
      {
        title: "Sarjana Terapan Teknologi Rekayasa Pengelasan dan Fabrikasi",
        code: "ME-STTRPF",
      },
      { title: "Program Profesi Insinyur (PSPPI)", code: "ME-PSPPI" },
    ],
  },
];

export async function DepartmentAndStudyProgramSeeder(prisma: PrismaClient) {
  await Promise.all(
    DATA.map(async (item) => {
      let department = await prisma.tbm_department.findFirst({
        where: { title: item.title },
      });

      if (!department) {
        department = await prisma.tbm_department.create({
          data: {
            code: item.code,
            title: item.title,
          },
        });
      } else {
        await prisma.tbm_department.update({
          where: { id: department.id },
          data: {
            code: item.code,
            title: item.title,
          },
        });
      }

      await Promise.all(
        item.study_programs.map(async (study_program) => {
          const exist = await prisma.tbm_study_program.findFirst({
            where: { title: study_program.title },
          });

          if (!exist) {
            await prisma.tbm_study_program.create({
              data: {
                department_id: department.id,
                title: study_program.title,
                code: study_program.code,
              },
            });
          } else {
            await prisma.tbm_study_program.update({
              where: { id: exist.id },
              data: {
                department_id: department.id,
                title: study_program.title,
                code: study_program.code,
              },
            });
          }
        })
      );
    })
  );

  console.log("Department and Study Program seeded successfully", {
    tbm_department: await prisma.tbm_department.count(),
    tbm_study_program: await prisma.tbm_study_program.count(),
  });
}
