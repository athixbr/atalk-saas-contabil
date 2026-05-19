import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateService from "../services/CrmTaxRegimeServices/CreateService";
import ListService from "../services/CrmTaxRegimeServices/ListService";
import UpdateService from "../services/CrmTaxRegimeServices/UpdateService";
import ShowService from "../services/CrmTaxRegimeServices/ShowService";
import DeleteService from "../services/CrmTaxRegimeServices/DeleteService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { active } = req.query;

  const taxRegimes = await ListService({
    companyId,
    active: active !== undefined ? active === "true" : undefined
  });

  return res.json(taxRegimes);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, description, active } = req.body;
  const { companyId } = req.user;

  const taxRegime = await CreateService({
    name,
    description,
    companyId,
    active
  });

  const io = getIO();
  io.emit(`company${companyId}-crm-tax-regime`, {
    action: "create",
    taxRegime
  });

  return res.status(200).json(taxRegime);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const taxRegime = await ShowService(id, companyId);

  return res.status(200).json(taxRegime);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { name, description, active } = req.body;
  const { companyId } = req.user;

  const taxRegime = await UpdateService({
    id,
    name,
    description,
    companyId,
    active
  });

  const io = getIO();
  io.emit(`company${companyId}-crm-tax-regime`, {
    action: "update",
    taxRegime
  });

  return res.status(200).json(taxRegime);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await DeleteService(id, companyId);

  const io = getIO();
  io.emit(`company${companyId}-crm-tax-regime`, {
    action: "delete",
    id
  });

  return res.status(200).json({ message: "Tax regime deleted" });
};
