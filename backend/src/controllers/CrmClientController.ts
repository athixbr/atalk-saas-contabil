import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateService from "../services/CrmClientServices/CreateService";
import ListService from "../services/CrmClientServices/ListService";
import ShowService from "../services/CrmClientServices/ShowService";
import UpdateService from "../services/CrmClientServices/UpdateService";
import DeleteService from "../services/CrmClientServices/DeleteService";

type IndexQuery = {
  userId?: string;
  status?: string;
  searchParam?: string;
  businessTypeId?: string;
  taxRegimeId?: string;
  pageNumber?: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { userId, status, searchParam, businessTypeId, taxRegimeId, pageNumber } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { clients, count, hasMore } = await ListService({
    companyId,
    userId: userId ? parseInt(userId) : undefined,
    status,
    searchParam,
    businessTypeId: businessTypeId ? parseInt(businessTypeId) : undefined,
    taxRegimeId: taxRegimeId ? parseInt(taxRegimeId) : undefined,
    pageNumber
  });

  return res.json({ clients, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    companyName,
    cnpj,
    phone,
    whatsapp,
    email,
    street,
    number,
    complement,
    neighborhood,
    city,
    state,
    zipCode,
    businessTypeId,
    taxRegimeId,
    userId,
    status,
    notes
  } = req.body;
  const { companyId } = req.user;

  const client = await CreateService({
    name,
    companyName,
    cnpj,
    phone,
    whatsapp,
    email,
    street,
    number,
    complement,
    neighborhood,
    city,
    state,
    zipCode,
    businessTypeId,
    taxRegimeId,
    userId,
    status,
    notes,
    companyId
  });

  const io = getIO();
  io.emit(`company${companyId}-crm-client`, {
    action: "create",
    client
  });

  return res.status(200).json(client);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { clientId } = req.params;
  const { companyId } = req.user;

  const client = await ShowService(clientId, companyId);

  return res.status(200).json(client);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { clientId } = req.params;
  const clientData = req.body;
  const { companyId } = req.user;

  const client = await UpdateService({
    clientData,
    id: clientId,
    companyId
  });

  const io = getIO();
  io.emit(`company${companyId}-crm-client`, {
    action: "update",
    client
  });

  return res.status(200).json(client);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { clientId } = req.params;
  const { companyId } = req.user;

  await DeleteService(clientId, companyId);

  const io = getIO();
  io.emit(`company${companyId}-crm-client`, {
    action: "delete",
    clientId
  });

  return res.status(200).json({ message: "Client deleted" });
};
