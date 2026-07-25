import prisma from "../../lib/prisma.service";

class Repository {
  async fetch() {
    return await prisma.tbm_role.findMany({
      where: { is_deleted: false },
      select: {
        id: true,
        name: true,
        label: true,
      },
      orderBy: { name: "asc" },
    });
  }
}

export const RoleRepository = new Repository();
