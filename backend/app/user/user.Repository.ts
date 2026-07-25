import { Prisma, tbm_user } from "@prisma/client";
import { PolibatamBiodata, PolibatamResponseBiodata } from "../../types";
import prisma from "../../lib/prisma.service";
import { PolibatamAct, polibatamInstance } from "../../lib/polibatam.service";

class Repository {
  async bulkStoreUser(users: tbm_user[]) {
    const staff_role_id = await prisma.tbm_role.findFirst({ select: { id: true }, where: { name: "staff" } }).then(role => role!.id);
    for (const user of users) {
      if (!user.nip) continue;

      await prisma.tbm_user.upsert({
        where: { nip: user.nip },
        update: user,
        create: {
          ...user,
          role_id: staff_role_id
        },
      });
    }
  }

  async checkUserExists(nip: string, include_user_roles_permissions: boolean = false) {
    return await prisma.tbm_user.findFirst({
      where: { nip, is_deleted: false },
      ...(include_user_roles_permissions && {
        include: {
          role: {
            include: {
              role_permissions: {
                include: {
                  permission: true,
                }
              }
            }
          }
        }
      }),
    });
  }

  async checkOrInsertUser({
    nip,
    secretkey,
  }: {
    nip: string;
    secretkey: string;
  }) {
    const user = await prisma.tbm_user.findFirst({
      where: { nip },
    });

    if (!user) {
      const biodataResponse: PolibatamResponseBiodata = await polibatamInstance(
        {
          method: "POST",
          data: {
            act: PolibatamAct.GetBiodata,
            secretkey: secretkey,
          },
        }
      );

      return await prisma.tbm_user.create({
        data: {
          id: biodataResponse.data.id,
          nip: biodataResponse.data.id,
          name: biodataResponse.data.nama,
          email: biodataResponse.data.email,
          is_admin: false,
        },
      });
    }

    return user;
  }

  async FetchUser({
    search,
    page = 1,
    page_size = 10,

    user_department_id
  }: {
    search?: string;
    page?: number;
    page_size?: number;

    user_department_id?: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const where: Prisma.tbm_userWhereInput = {
        is_deleted: false,
        ...(search && {
          OR: [
            { nip: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(user_department_id && { department_id: user_department_id }),
      };

      const include: Prisma.tbm_userInclude = {
        role: {
          select: {
            id: true,
            name: true,
            label: true
          }
        },
        department: {
          select: {
            id: true,
            title: true
          }
        }
      };

      const results = await tx.tbm_user.findMany({
        where,
        include,
        orderBy: { name: "asc" },
        take: page_size,
        skip: (page - 1) * page_size,
      });

      const count = await tx.tbm_user.count({ where });

      return {
        data: results,
        pagination: {
          page,
          page_size,
          total_items: count,
          total_pages: Math.ceil(count / page_size),
        },
      };
    });
  }

  async FetchUserByNIP(nip: string) {
    return await prisma.tbm_user.findFirst({
      where: { nip },
    });
  }

  Upsert = async (data: PolibatamBiodata) => {
    const user = await prisma.tbm_user.findFirst({
      where: { id: data.id },
    });

    if (!user) {
      return await prisma.tbm_user.create({
        data: {
          id: data.id,
          nip: data.id,
          name: data.nama,
          email: data.email,
          is_admin: false,
        },
      });
    }

    return user;
  };

  async ToggleUserRole(nip: string) {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.tbm_user.findUnique({
        where: { nip },
      });

      if (!user) throw new Error("User not found");

      return await tx.tbm_user.update({
        where: { nip },
        data: {
          is_admin: !user.is_admin,
        },
      });
    });
  }

  async SetUserRoles(nip: string, role_id: string) {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.tbm_user.findUnique({
        where: { nip },
      });
      if (!user) throw new Error("User not found");

      const role = await tx.tbm_role.findUnique({
        where: { id: role_id },
      });
      if (!role) throw new Error("Role not found");

      return await tx.tbm_user.update({
        where: {nip},
        data: { role_id: role.id }
      });
    });
  }

  async SetUserDepartment(nip: string, department_id: string) {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.tbm_user.findUnique({
        where: { nip },
      });
      if (!user) throw new Error("User not found");

      const department = await tx.tbm_department.findUnique({
        where: { id: department_id },
      });
      if (!department) throw new Error("Department not found");

      return await tx.tbm_user.update({
        where: {nip},
        data: { department_id: department.id }
      });
    });
  }
}

export const UserRepository = new Repository();
