import { UploadDocument } from "../../utils/multer";
import { Request, Response, NextFunction } from "express";
import * as XLSX from "xlsx";
import { ErrorResponse, Ok } from "../../utils/api-response";
import prisma from "../../lib/prisma.service";
import { generateAIContent } from "../../lib/openai.service";

const Upload = UploadDocument.single("file");

class Middleware {
  upload = async (req: Request, res: Response, next: NextFunction) => {
    Upload(req, res, async (err) => {
      if (err) throw new Error(err?.message);

      if (req.file) {
        req.body.file = req.file;
        req.body.filepath = req.file.path;
      }

      next();
    });
  };

  convertExcelToJson = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { file } = req.body;

      if (!file) {
        return res.status(400).json({ message: "File not found" });
      }

      const workbook = XLSX.readFile(file.path);
      //   can you do all sheet names
      const sheetName = workbook.SheetNames[0];
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      req.body.jsonData = jsonData;

      const assessmentTypes = await prisma.tbm_assessment_type.findMany({
        where: { is_deleted: false },
        select: { code: true, title: true },
      });

      const prompt = `
You are a JSON converter.

You are given:
- An array of students with NIM, name, and their raw score data.
- An array of assessment types with explicit codes like A1, A2, ..., PP3, Q1, MSE1, etc.

Convert the data into this format:

[
  {
    "nim": "4222221001",
    "name": "Agnes",
    "scores": [
      { "key": "A1", "value": 70 },
      { "key": "A2", "value": 70 },
      ...
      { "key": "FSE1", "value": 0 }
    ]
  }
]

Rules:
- Use the assessment type codes exactly (like "A1", "P2", "Q1", etc.).
- Use value from student data when available.
- If value is missing or blank, default to 0.
- Output valid JSON only.

assessmentTypes: ${JSON.stringify(assessmentTypes)}
studentData: ${JSON.stringify(jsonData)}
`;

      const AIResponse = await generateAIContent(prompt);

      //   const rawText: string =
      //     AIResponse?.replace(/```(?:json)?/g, "").trim() || "";

      return Ok({ res, data: AIResponse });
    } catch (error) {
      return ErrorResponse({ req, res, error });
    } finally {
      // Delete the file after processing
      if (req.body.file) {
        const fs = require("fs");
        fs.unlink(req.body.file.path, (err: any) => {
          if (err) {
            console.error("Error deleting file:", err);
          } else {
            console.log("File deleted successfully");
          }
        });
      }
    }
  };
}

export const AiMiddleware = new Middleware();
