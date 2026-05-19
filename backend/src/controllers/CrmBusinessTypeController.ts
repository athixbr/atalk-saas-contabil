import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateService from "../services/CrmBusinessTypeServices/CreateService";
import ListService from "../services/CrmBusinessTypeServices/ListService";
import UpdateService from "../services/CrmBusinessTypeServices/UpdateService";
import ShowService from "../services/CrmBusinessTypeServices/ShowService";
import DeleteService from "../services/CrmBusinessTypeServices/DeleteService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { active } = req.query;

  const businessTypes = await ListService({
    companyId,
    active: active !== undefined ? active === "true" : undefined
  });

  return res.json(businessTypes);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, description, active } = req.body;
  const { companyId } = req.user;

  const businessType = await CreateService({
    name,
    description,
    companyId,
    active
  });

  const io = getIO();
  io.emit(`company${companyId}-crm-business-type`, {
    action: "create",
    businessType
  });

  return res.status(200).json(businessType);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const businessType = await ShowService(id, companyId);

  return res.status(200).json(businessType);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { name, description, active } = req.body;
  const { companyId } = req.user;

  const businessType = await UpdateService({
    id,
    name,
    description,
    companyId,
    active
  });

  const io = getIO();
  io.emit(`company${companyId}-crm-business-type`, {
    action: "update",
    businessType
  });

  return res.status(200).json(businessType);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await DeleteService(id, companyId);

  const io = getIO();
  io.emit(`company${companyId}-crm-business-type`, {
    action: "delete",
    id
  });

  return res.status(200).json({ message: "Business type deleted" });
};
