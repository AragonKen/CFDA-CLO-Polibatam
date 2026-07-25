import prisma from "../../lib/prisma.service";

async function user_role_migration_func() {
  console.log("[RUNNING] Migrating user role...");
  const admin_role_id = await prisma.tbm_role.findFirst({ select: { id: true }, where: { name: "admin" } }).then(role => role?.id);
  if (!admin_role_id) throw new Error("Admin role not found. Maybe you forgot to run the role_permission seeders");

  const staff_role_id = await prisma.tbm_role.findFirst({ select: { id: true }, where: { name: "staff" } }).then(role => role?.id);
  if (!staff_role_id) throw new Error("Staff role not found. Maybe you forgot to run the role_permission seeders");

  await prisma.tbm_user.updateMany({
    where: { is_admin: true },
    data: { role_id: admin_role_id }
  });

  await prisma.tbm_user.updateMany({
    where: { is_admin: false },
    data: { role_id: staff_role_id }
  });

  console.log("[DONE] User role migration success");
}

export default user_role_migration_func;
