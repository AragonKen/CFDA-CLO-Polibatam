import { Request, Response, NextFunction } from "express";
import { Unauthorized, Forbidden } from "../utils/api-response";
import { DecryptToken } from "../utils/jwt";

import { logger, logWithoutConsole } from "../lib/logger.service";
import { inspect } from "util";
import { UserRepository } from "../app/user/user.Repository";

import { Prisma } from "@prisma/client";

type UserWithPermissions = Prisma.tbm_userGetPayload<{
  include: {
    role: {
      include: {
        role_permissions: {
          include: {
            permission: true
          }
        }
      };
    };
  };
}>;

export const AuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const BearerToken = req.headers.authorization;
  if (!BearerToken)
    return Unauthorized({ res, message: "Unauthorized : Token not found" });

  try {
    const token = BearerToken.split(" ")[1];
    if (!token)
      return Unauthorized({ res, message: "Unauthorized : Token not found" });

    const decode = DecryptToken(token);
    if (!decode) return Unauthorized({ res, message: "Session Expired :(" });

    const user = await UserRepository.checkUserExists(
      (decode as any)?.user.nip,
      true
    ) as UserWithPermissions;

    if (!user) {
      return Unauthorized({ res, message: "User not found or inactive" });
    }

    logWithoutConsole({
      level: "info",
      message: `${user?.name} is accessing ${req.originalUrl}`,
    });

    req.cookies.user = {};
    req.cookies.secretkey = (decode as any)?.secretkey;

    req.user = {
      id: user.id,
      name: user.name,
      department_id: user.department_id ?? null,
      role: user.role?.name || "staff",
      permissions: user.role ? user.role?.role_permissions.map(rp => rp.permission.name) : []
    };

    next();
  } catch (error) {
    console.log("Error:", error);

    return Unauthorized({ res, message: "Unauthorized" });
  }
};

export const require_permission = (permission_name: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return Unauthorized({ res, message: "Unauthorized" });
    }

    const permissions = user.permissions;

    if (!permissions.includes(permission_name)) {
      return Forbidden({ res, message: `You don't have permission to access this feature. Please contact the administrator` });
    }
    next();
  }
}

export const require_in_unit = (get_department_id_func: (req: Request) => Promise<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user!;

    if (user.role === "admin") return next();

    if (!user.department_id)
      return Forbidden({
        res,
        message: "You are not assigned to any department"
      });

    const department_id = await get_department_id_func(req);

    if (user.department_id !== department_id)
      return Forbidden({
        res,
        message: "This action can only be performed by users in the same department"
      });

    next();
  }
}

export const ErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Request Error:
        \nError:\n${JSON.stringify(err)}
        \nHeaders:\n${inspect(req.headers)}
        \nParams:\n${inspect(req.params)}
        \nQuery:\n${inspect(req.query)}
        \nBody:\n${inspect(req.body)}`);

  next();
};
