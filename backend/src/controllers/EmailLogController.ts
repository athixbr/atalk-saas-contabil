import { Request, Response } from "express";
import ListEmailLogsService from "../services/EmailLogServices/ListEmailLogsService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { page = "1", limit = "20" } = req.query as any;

  const result = await ListEmailLogsService({
    companyId,
    page: parseInt(page),
    limit: parseInt(limit),
  });

  return res.json(result);
};
