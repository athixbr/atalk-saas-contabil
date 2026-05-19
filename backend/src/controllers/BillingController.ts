import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateService from "../services/BillingServices/CreateService";
import ListService from "../services/BillingServices/ListService";
import ShowService from "../services/BillingServices/ShowService";
import UpdateService from "../services/BillingServices/UpdateService";
import DeleteService from "../services/BillingServices/DeleteService";
import AddHistoryService from "../services/BillingServices/AddHistoryService";
import GetHistoryService from "../services/BillingServices/GetHistoryService";
import GetReportService from "../services/BillingServices/GetReportService";

type IndexQuery = {
  searchParam?: string;
  status?: string;
  contactId?: number | string;
  pageNumber?: string | number;
  startDate?: string;
  endDate?: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, status, contactId, pageNumber, startDate, endDate } =
    req.query as IndexQuery;
  const { companyId } = req.user;

  const { billings, count, hasMore } = await ListService({
    searchParam,
    status,
    contactId,
    pageNumber,
    companyId,
    startDate,
    endDate
  });

  return res.json({ billings, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    contactId,
    clientName,
    tradeName,
    accountPayable,
    accountReceivable,
    balance,
    totalAmount,
    dueDate,
    nextContactDate,
    contractNumber,
    paymentMethod,
    status,
    notes
  } = req.body;
  const { companyId, id: createdBy } = req.user;

  const billing = await CreateService({
    companyId,
    contactId,
    clientName,
    tradeName,
    accountPayable,
    accountReceivable,
    balance,
    totalAmount,
    dueDate,
    nextContactDate,
    contractNumber,
    paymentMethod,
    status,
    notes,
    createdBy
  });

  const io = getIO();
  io.emit(`company${companyId}-billing`, {
    action: "create",
    billing
  });

  return res.status(200).json(billing);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { billingId } = req.params;
  const { companyId } = req.user;

  const billing = await ShowService(billingId, companyId);

  return res.status(200).json(billing);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { billingId } = req.params;
  const billingData = req.body;
  const { companyId, id: updatedBy } = req.user;

  const billing = await UpdateService({
    billingData,
    id: billingId,
    companyId,
    updatedBy
  });

  const io = getIO();
  io.emit(`company${companyId}-billing`, {
    action: "update",
    billing
  });

  return res.status(200).json(billing);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { billingId } = req.params;
  const { companyId } = req.user;

  await DeleteService(billingId, companyId);

  const io = getIO();
  io.emit(`company${companyId}-billing`, {
    action: "delete",
    billingId
  });

  return res.status(200).json({ message: "Billing deleted" });
};

export const addHistory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { billingId } = req.params;
  const {
    contactDate,
    contactType,
    description,
    previousStatus,
    newStatus,
    amountPaid
  } = req.body;
  const { companyId, id: userId } = req.user;

  const history = await AddHistoryService({
    billingId,
    companyId,
    contactDate,
    contactType,
    description,
    previousStatus,
    newStatus,
    amountPaid,
    userId
  });

  const io = getIO();
  io.emit(`company${companyId}-billing`, {
    action: "history-added",
    billingId,
    history
  });

  return res.status(200).json(history);
};

export const getHistory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { billingId } = req.params;
  const { companyId } = req.user;

  const history = await GetHistoryService({
    billingId,
    companyId
  });

  return res.status(200).json(history);
};

export const getReport = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { period, date } = req.query as { period: "daily" | "weekly" | "monthly"; date?: string };
  const { companyId } = req.user;

  const report = await GetReportService({
    companyId,
    period,
    date: date ? new Date(date) : new Date()
  });

  return res.status(200).json(report);
};
