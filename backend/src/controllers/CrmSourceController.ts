import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateService from "../services/CrmSourceServices/CreateService";
import ListService from "../services/CrmSourceServices/ListService";
import UpdateService from "../services/CrmSourceServices/UpdateService";
import ShowService from "../services/CrmSourceServices/ShowService";
import DeleteService from "../services/CrmSourceServices/DeleteService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { active } = req.query;

  const sources = await ListService({
    companyId,
    active: active !== undefined ? active === "true" : undefined
  });

  return res.json(sources);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, description, active } = req.body;
  const { companyId } = req.user;

  const source = await CreateService({
    name,
    description,
    companyId,
    active
  });

  const io = getIO();
  io.emit(`company${companyId}-crm-source`, {
    action: "create",
    source
  });

  return res.status(200).json(source);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const source = await ShowService(id, companyId);

  return res.status(200).json(source);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { name, description, active } = req.body;
  const { companyId } = req.user;

  const source = await UpdateService({
    id,
    name,
    description,
    companyId,
    active
  });

  const io = getIO();
  io.emit(`company${companyId}-crm-source`, {
    action: "update",
    source
  });

  return res.status(200).json(source);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await DeleteService(id, companyId);

  const io = getIO();
  io.emit(`company${companyId}-crm-source`, {
    action: "delete",
    id
  });

  return res.status(200).json({ message: "Source deleted" });
};
