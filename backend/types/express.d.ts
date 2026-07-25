import "express";

declare global{
  namespace Express {
    interface Request {
      user?: {
        id: string,
        name: string,
        department_id: string | null,
        role: string,
        permissions: string[]
      }
    }
  }
}

export {};
