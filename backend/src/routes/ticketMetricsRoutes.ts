import express from "express";
import isAuth from "../middleware/isAuth";
import * as TicketMetricsController from "../controllers/TicketMetricsController";

const ticketMetricsRoutes = express.Router();

// Relatório de tempo dos tickets
ticketMetricsRoutes.get(
  "/reports/tickets/time",
  isAuth,
  TicketMetricsController.listTicketTimeReports
);

// Relatório de performance dos usuários
ticketMetricsRoutes.get(
  "/reports/users/performance",
  isAuth,
  TicketMetricsController.listUserPerformance
);

export default ticketMetricsRoutes;
