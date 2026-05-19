import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateService from "../services/CrmInteractionServices/CreateService";
import ListService from "../services/CrmInteractionServices/ListService";
import UpdateService from "../services/CrmInteractionServices/UpdateService";
import ShowService from "../services/CrmInteractionServices/ShowService";
import DeleteService from "../services/CrmInteractionServices/DeleteService";

type IndexQuery = {
  leadId?: number | string;
  userId?: number | string;
  type?: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { leadId, userId, type } = req.query as IndexQuery;
  const { companyId } = req.user;

  const interactions = await ListService({
    companyId,
    leadId,
    userId,
    type
  });

  return res.json(interactions);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const interaction = await CreateService({
    ...req.body,
    companyId
  });

  const io = getIO();
  io.emit(`company${companyId}-crm-interaction`, {
    action: "create",
    interaction
  });

  return res.status(200).json(interaction);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const interaction = await ShowService(id, companyId);

  return res.status(200).json(interaction);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const interaction = await UpdateService({
    id,
    companyId,
    ...req.body
  });

  const io = getIO();
  io.emit(`company${companyId}-crm-interaction`, {
    action: "update",
    interaction
  });

  return res.status(200).json(interaction);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await DeleteService(id, companyId);

  const io = getIO();
  io.emit(`company${companyId}-crm-interaction`, {
    action: "delete",
    id
  });

  return res.status(200).json({ message: "Interaction deleted" });
};
