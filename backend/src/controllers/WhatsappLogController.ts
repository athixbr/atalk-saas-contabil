import { Request, Response } from "express";
import ListWhatsappLogsService from "../services/WhatsappLogServices/ListWhatsappLogsService";

export const index = async (req: Request, res: Response) => {
  const { companyId } = req.user;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await ListWhatsappLogsService({ companyId, page, limit });
  return res.json(result);
};
