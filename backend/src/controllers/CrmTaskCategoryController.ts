import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateService from "../services/CrmTaskCategoryServices/CreateService";
import ListService from "../services/CrmTaskCategoryServices/ListService";
import UpdateService from "../services/CrmTaskCategoryServices/UpdateService";
import ShowService from "../services/CrmTaskCategoryServices/ShowService";
import DeleteService from "../services/CrmTaskCategoryServices/DeleteService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { active, type } = req.query;

  const categories = await ListService({
    companyId,
    active: active !== undefined ? active === "true" : undefined,
    type: type as string
  });

  return res.json(categories);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, type, icon, color, active } = req.body;
  const { companyId } = req.user;

  const category = await CreateService({
    name,
    type,
    icon,
    color,
    companyId,
    active
  });

  const io = getIO();
  io.emit(`company${companyId}-crm-task-category`, {
    action: "create",
    category
  });

  return res.status(200).json(category);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const category = await ShowService(id, companyId);

  return res.status(200).json(category);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { name, type, icon, color, active } = req.body;
  const { companyId } = req.user;

  const category = await UpdateService({
    id,
    name,
    type,
    icon,
    color,
    companyId,
    active
  });

  const io = getIO();
  io.emit(`company${companyId}-crm-task-category`, {
    action: "update",
    category
  });

  return res.status(200).json(category);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await DeleteService(id, companyId);

  const io = getIO();
  io.emit(`company${companyId}-crm-task-category`, {
    action: "delete",
    id
  });

  return res.status(200).json({ message: "Task category deleted" });
};
