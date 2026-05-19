import { Request, Response } from "express";
import CreateService from "../services/CrmTaskStageServices/CreateService";
import ListService from "../services/CrmTaskStageServices/ListService";
import UpdateService from "../services/CrmTaskStageServices/UpdateService";
import DeleteService from "../services/CrmTaskStageServices/DeleteService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const stages = await ListService({ companyId });

  return res.json({ stages });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { name, color, order } = req.body;

  const stage = await CreateService({
    companyId,
    name,
    color,
    order
  });

  return res.status(201).json(stage);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { stageId } = req.params;
  const { name, color, order } = req.body;

  const stage = await UpdateService({
    stageId,
    name,
    color,
    order
  });

  return res.json(stage);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { stageId } = req.params;

  await DeleteService({ stageId });

  return res.status(204).send();
};
