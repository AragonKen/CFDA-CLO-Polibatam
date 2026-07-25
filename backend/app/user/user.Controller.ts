import { Request, Response } from "express";
import { BadRequest, ErrorResponse, Ok } from "../../utils/api-response";

import { tbm_user } from "@prisma/client";
import { PolibatamPegawai } from "../../types";
import { PolibatamAct, polibatamInstance } from "../../lib/polibatam.service";
import { UserRepository } from "./user.Repository";

import { get_user_department } from "../../utils/helper";

class Controller {
  async GenerateUser(req: Request, res: Response) {
    try {
      let results: PolibatamPegawai[] = [];

      const token = await polibatamInstance({
        method: "POST",
        data: {
          act: PolibatamAct.GetToken,
          secretkey: req.cookies.secretkey,
        },
      });

      const resPegawai = await polibatamInstance({
        method: "POST",
        data: {
          act: PolibatamAct.GetSemuaPegawai,
          token: token.data.token,
          limit: 1000,
        },
      });

      results = resPegawai.data;
      // if (!results) throw new Error("[POLIBATAM API] : No data found");
      if (!results || results.length === 0)
        throw new Error("[POLIBATAM API] : No data found");

      console.log("Generated User => " + results.length);

      const data: tbm_user[] = results.map((item) => {
        return {
          id: item.NIP,
          nip: item.NIP,
          name: item.NAMA,
          title_prefix: item.GELAR_DPN,
          title_suffix: item.GELAR_BLK,
          religion: item.AGAMA,
          email: item.EMAIL,
          gender: item.SEX,
          employee_status_id: item.NOMOR_STATUS_KARYAWAN,
          employee_status: item.STATUS_KARYAWAN,
          contract_status_id: item.NOMOR_STATUS_KONTRAK,
          contract_status: item.STATUS_KONTRAK,
          staff_number: item.NOMOR_STAFF,
          staff_role: item.STAFF,
          unit_number: item.NOMOR_UNIT,
          unit: item.UNIT,
          line_number: item.LINE_NUMBER,
          role_id: null,
          department_id: null,

          is_admin: false,
          created_at: new Date(),
          updated_at: new Date(),
          is_deleted: false,
        };
      });

      await UserRepository.bulkStoreUser(data);

      return Ok({ res, message: "Successfully generated user" });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async GetUser(req: Request, res: Response) {
    try {
      const { search, page, page_size, in_user_department } = req.query;

      const user_department_id = get_user_department(req.user);

      const result = await UserRepository.FetchUser({
        search: search ? String(search) : undefined,
        page: page ? Number(page) : 1,
        page_size: page_size ? Number(page_size) : 10,
        user_department_id: in_user_department === "true" ? (user_department_id ?? undefined) : undefined
      });

      if (result.data.length === 0 && result.pagination.page > 1 && !search) {
        await this.GenerateUser(req, res);
        await this.GetUser(req, res);
      }

      return Ok({ res, data: result.data, pagination: result.pagination });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async GetUserByNIP(req: Request, res: Response) {
    try {
      const { id: NIP } = req.params;

      const result = await UserRepository.FetchUserByNIP(NIP);

      return Ok({ res, data: result });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  // Switch to SetUserRole Function
  // async ToggleUserRole(req: Request, res: Response) {
  //   try {
  //     const { id: NIP } = req.params;
  //
  //     const result = await UserRepository.ToggleUserRole(NIP);
  //
  //     return Ok({ res, data: result });
  //   } catch (error) {
  //     return ErrorResponse({ req, res, error });
  //   }
  // }

  async SetUserRole(req: Request, res: Response) {
    try {
      const { id: NIP } = req.params;
      const { role_id } = req.body;

      if (!role_id) {
        return BadRequest({ res, message: "role_id required" });
      }

      // Check if target user exists
      const targetUser = await UserRepository.checkUserExists(NIP);
      if (!targetUser) {
        return BadRequest({ res, message: "User not found" });
      }

      // Prevent self-modification
      if (targetUser.id === req.user?.id) {
        return BadRequest({ res, message: "You cannot modify your own roles" });
      }

      // Perform set user roles
      const result = await UserRepository.SetUserRoles(NIP, role_id);

      return Ok({ res, data: result, message: "Successfully updated user roles" });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async SetUserDepartment(req: Request, res: Response) {
    try {
      const { id: NIP } = req.params;
      const { department_id } = req.body;

      if (!department_id) {
        return BadRequest({ res, message: "department_id required" });
      }

      const targetUser = await UserRepository.checkUserExists(NIP);
      if (!targetUser) {
        return BadRequest({ res, message: "User not found" });
      }

      const result = await UserRepository.SetUserDepartment(NIP, department_id);

      return Ok({ res, data: result, message: "Successfully updated user roles" });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}



export const UserController = new Controller();
