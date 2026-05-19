import { Request, Response } from "express";
import ListTicketTimeReportsService from "../services/TicketMetricsServices/ListTicketTimeReportsService";
import ListUserPerformanceService from "../services/TicketMetricsServices/ListUserPerformanceService";

export const listTicketTimeReports = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { dateStart, dateEnd, userId, queueId, status } = req.query;

  const reports = await ListTicketTimeReportsService({
    companyId,
    dateStart: dateStart as string,
    dateEnd: dateEnd as string,
    userId: userId ? Number(userId) : undefined,
    queueId: queueId ? Number(queueId) : undefined,
    status: status as string
  });

  return res.status(200).json(reports);
};

export const listUserPerformance = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { dateStart, dateEnd, userId } = req.query;

  const performance = await ListUserPerformanceService({
    companyId,
    dateStart: dateStart as string,
    dateEnd: dateEnd as string,
    userId: userId ? Number(userId) : undefined
  });

  return res.status(200).json(performance);
};
