import { Request, Response } from "express";

import ListWhatsappGroupsService from "../services/WhatsappGroupServices/ListWhatsappGroupsService";
import SyncWhatsappGroupsService from "../services/WhatsappGroupServices/SyncWhatsappGroupsService";

type IndexQuery = {
  whatsappId?: string;
  searchParam?: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId, searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { groups, needsSync } = await ListWhatsappGroupsService({
    companyId,
    whatsappId: whatsappId ? parseInt(whatsappId) : undefined,
    searchParam
  });

  return res.json({ groups, needsSync });
};

export const sync = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.query as IndexQuery;
  const { companyId } = req.user;

  const groups = await SyncWhatsappGroupsService({
    companyId,
    whatsappId: whatsappId ? parseInt(whatsappId) : undefined,
    forceSync: true
  });

  return res.json({ groups, message: "Grupos sincronizados com sucesso" });
};
