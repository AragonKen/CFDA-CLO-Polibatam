import prisma from "../../lib/prisma.service";

async function user_department_migration_func() {
  console.log("[RUNNING] Migrating user department...");
  const users = await prisma.tbm_user.findMany({
    select: { id: true, unit: true },
    where: { unit: { startsWith: "Jurusan" } }
  });

  const departments = await prisma.tbm_department.findMany({
    select: { id: true, title: true },
  });

  const user_with_department_id = users.map(user => {
    let department_reference = "";
    department_reference = user.unit!.split(" ").slice(1).join(" ");

    for (const d of departments) {
      if (d.title === department_reference) return { ...user, department_id: d.id };
    }
    return { ...user, department_id: null };
  });

  for (const user of user_with_department_id) {
    await prisma.tbm_user.update({
      data: { department_id: user.department_id },
      where: { id: user.id }
    });
  }

  console.log("[DONE] User department migration success");
}

export default user_department_migration_func;
