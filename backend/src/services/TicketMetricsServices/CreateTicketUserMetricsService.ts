import TicketUserMetrics from "../../models/TicketUserMetrics";
import TicketMetrics from "../../models/TicketMetrics";
import moment from "moment";

interface Request {
  ticketId: number;
  ticketMetricId: number;
  userId: number;
  companyId: number;
  queueId?: number;
  recebeuTransferencia?: boolean;
}

const CreateTicketUserMetricsService = async ({
  ticketId,
  ticketMetricId,
  userId,
  companyId,
  queueId,
  recebeuTransferencia = false
}: Request): Promise<TicketUserMetrics> => {
  // Verifica se já existe métrica ativa para este usuário neste ticket
  const existingMetric = await TicketUserMetrics.findOne({
    where: {
      ticketId,
      userId,
      finishedAt: null
    }
  });

  if (existingMetric) {
    return existingMetric;
  }

  // Conta quantos já atenderam (para definir order)
  const count = await TicketUserMetrics.count({
    where: { ticketId }
  });

  // Cria nova métrica de usuário
  const userMetric = await TicketUserMetrics.create({
    ticketId,
    ticketMetricId,
    userId,
    companyId,
    queueId,
    startedAt: new Date(),
    recebeuTransferencia,
    order: count + 1
  });

  return userMetric;
};

export default CreateTicketUserMetricsService;
