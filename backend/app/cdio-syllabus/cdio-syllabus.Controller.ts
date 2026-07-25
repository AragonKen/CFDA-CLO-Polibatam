import { Request, Response } from "express";
import { ErrorResponse, Ok } from "../../utils/api-response";
import { CDIOSyllabusRepository } from "./cdio-syllabus.Repository";

class Controller {
  async bulkCreate(req: Request, res: Response) {
    try {
      const created = await CDIOSyllabusRepository.bulkStore({
        data: req.body,
        creator: req.cookies.user,
      });

      return Ok({ res, data: created });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async getParent(req: Request, res: Response) {
    try {
      const { search, page, page_size, study_program_id } = req.query;

      const data = await CDIOSyllabusRepository.fetchParent({
        search: search ? String(search) : undefined,

        page: page ? Number(page) : 1,
        page_size: page_size ? Number(page_size) : 10,

        study_program_id: study_program_id
          ? String(study_program_id)
          : undefined,
      });

      return Ok({ res, data: data.data, pagination: data.pagination });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async getParentByID(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data = await CDIOSyllabusRepository.fetchParentByID(id);

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async createParent(req: Request, res: Response) {
    try {
      const data = await CDIOSyllabusRepository.storeParent({
        data: req.body,
      });

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async updateParent(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data = await CDIOSyllabusRepository.updateParent({
        id: String(id),
        data: req.body,
      });

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async deleteParent(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await CDIOSyllabusRepository.deleteParent(id);

      return Ok({ res });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  // ==================================================================================
  // CDIO Syllabus
  // ==================================================================================

  async get(req: Request, res: Response) {
    try {
      const { search, page, page_size, study_program_id } = req.query;

      const data = await CDIOSyllabusRepository.fetch({
        search: search ? String(search) : undefined,

        page: page ? Number(page) : 1,
        page_size: page_size ? Number(page_size) : 10,

        study_program_id: study_program_id
          ? String(study_program_id)
          : undefined,
      });

      return Ok({ res, data: data.data, pagination: data.pagination });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async getByID(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data = await CDIOSyllabusRepository.fetchByID(id);

      return Ok({ res, data });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = req.body;

      const created = await CDIOSyllabusRepository.store({ data });

      return Ok({ res, data: created });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const data = req.body;

      const updated = await CDIOSyllabusRepository.update({ id, data });

      return Ok({ res, data: updated });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id;

      await CDIOSyllabusRepository.delete(id);

      return Ok({ res });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    }
  }
}

export const CDIOSyllabusController = new Controller();
