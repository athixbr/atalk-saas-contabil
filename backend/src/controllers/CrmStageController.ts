import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateService from "../services/CrmStageServices/CreateService";
import ListService from "../services/CrmStageServices/ListService";
import UpdateService from "../services/CrmStageServices/UpdateService";
import ShowService from "../services/CrmStageServices/ShowService";
import DeleteService from "../services/CrmStageServices/DeleteService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { active } = req.query;

  const stages = await ListService({
    companyId,
    active: active !== undefined ? active === "true" : undefined
  });

  return res.json(stages);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, order, color, active } = req.body;
  const { companyId } = req.user;

  const stage = await CreateService({
    name,
    order,
    color,
    companyId,
    active
  });

  const io = getIO();
  io.emit(`company${companyId}-crm-stage`, {
    action: "create",
    stage
  });

  return res.status(200).json(stage);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const stage = await ShowService(id, companyId);

  return res.status(200).json(stage);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { name, order, color, active } = req.body;
  const { companyId } = req.user;

  const stage = await UpdateService({
    id,
    name,
    order,
    color,
    companyId,
    active
  });

  const io = getIO();
  io.emit(`company${companyId}-crm-stage`, {
    action: "update",
    stage
  });

  return res.status(200).json(stage);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await DeleteService(id, companyId);

  const io = getIO();
  io.emit(`company${companyId}-crm-stage`, {
    action: "delete",
    id
  });

  return res.status(200).json({ message: "Stage deleted" });
};
