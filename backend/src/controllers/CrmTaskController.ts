import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateService from "../services/CrmTaskServices/CreateService";
import ListService from "../services/CrmTaskServices/ListService";
import UpdateService from "../services/CrmTaskServices/UpdateService";
import ShowService from "../services/CrmTaskServices/ShowService";
import DeleteService from "../services/CrmTaskServices/DeleteService";

type IndexQuery = {
  leadId?: number | string;
  clientId?: number | string;
  userId?: number | string;
  categoryId?: number | string;
  status?: string;
  priority?: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { leadId, clientId, userId, categoryId, status, priority } = req.query as IndexQuery;
  const { companyId } = req.user;

  const tasks = await ListService({
    companyId,
    leadId,
    clientId,
    userId,
    categoryId,
    status,
    priority
  });

  return res.json(tasks);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const task = await CreateService({
    ...req.body,
    companyId
  });

  const io = getIO();
  io.emit(`company${companyId}-crm-task`, {
    action: "create",
    task
  });

  return res.status(200).json(task);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const task = await ShowService(id, companyId);

  return res.status(200).json(task);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const task = await UpdateService({
    id,
    companyId,
    ...req.body
  });

  const io = getIO();
  io.emit(`company${companyId}-crm-task`, {
    action: "update",
    task
  });

  return res.status(200).json(task);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await DeleteService(id, companyId);

  const io = getIO();
  io.emit(`company${companyId}-crm-task`, {
    action: "delete",
    id
  });

  return res.status(200).json({ message: "CRM task deleted" });
};
