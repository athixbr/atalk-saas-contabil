import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateService from "../services/CrmLeadServices/CreateService";
import ListService from "../services/CrmLeadServices/ListService";
import UpdateService from "../services/CrmLeadServices/UpdateService";
import ShowService from "../services/CrmLeadServices/ShowService";
import DeleteService from "../services/CrmLeadServices/DeleteService";

type IndexQuery = {
  userId?: number | string;
  stage?: string;
  status?: string;
  searchParam?: string;
  businessTypeId?: number | string;
  taxRegimeId?: number | string;
  sourceId?: number | string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { 
    userId, 
    stage, 
    status, 
    searchParam,
    businessTypeId,
    taxRegimeId,
    sourceId
  } = req.query as IndexQuery;
  const { companyId } = req.user;

  const leads = await ListService({
    companyId,
    userId,
    stage,
    status,
    searchParam,
    businessTypeId,
    taxRegimeId,
    sourceId
  });

  return res.json(leads);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const lead = await CreateService({
    ...req.body,
    companyId
  });

  const io = getIO();
  io.emit(`company${companyId}-crm-lead`, {
    action: "create",
    lead
  });

  return res.status(200).json(lead);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const lead = await ShowService(id, companyId);

  return res.status(200).json(lead);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const lead = await UpdateService({
    id,
    companyId,
    ...req.body
  });

  const io = getIO();
  io.emit(`company${companyId}-crm-lead`, {
    action: "update",
    lead
  });

  return res.status(200).json(lead);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await DeleteService(id, companyId);

  const io = getIO();
  io.emit(`company${companyId}-crm-lead`, {
    action: "delete",
    id
  });

  return res.status(200).json({ message: "Lead deleted" });
};
