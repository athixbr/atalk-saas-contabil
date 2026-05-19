import TicketMetrics from "../../models/TicketMetrics";
import Ticket from "../../models/Ticket";

interface Request {
  ticketId: number;
  companyId: number;
}

const CreateTicketMetricsService = async ({
  ticketId,
  companyId
}: Request): Promise<TicketMetrics> => {
  // Verifica se já existe métrica para este ticket
  const existingMetric = await TicketMetrics.findOne({
    where: { ticketId }
  });

  if (existingMetric) {
    return existingMetric;
  }

  // Busca o ticket para pegar a data de criação
  const ticket = await Ticket.findByPk(ticketId);

  if (!ticket) {
    throw new Error("Ticket não encontrado");
  }

  // Cria nova métrica
  const metric = await TicketMetrics.create({
    ticketId,
    companyId,
    createdAt: ticket.createdAt,
    status: ticket.status
  });

  return metric;
};

export default CreateTicketMetricsService;
