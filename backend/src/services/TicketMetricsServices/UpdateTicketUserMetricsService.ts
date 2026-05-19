import TicketUserMetrics from "../../models/TicketUserMetrics";
import TicketMetrics from "../../models/TicketMetrics";
import moment from "moment";

interface Request {
  ticketId: number;
  userId: number;
  action: "message" | "transfer" | "close";
}

const UpdateTicketUserMetricsService = async ({
  ticketId,
  userId,
  action
}: Request): Promise<void> => {
  // Busca métrica ativa do usuário
  const userMetric = await TicketUserMetrics.findOne({
    where: {
      ticketId,
      userId,
      finishedAt: null
    }
  });

  if (!userMetric) {
    return;
  }

  const now = moment();

  switch (action) {
    case "message":
      // Incrementa mensagens enviadas
      const updates: any = {
        totalMensagensEnviadas: userMetric.totalMensagensEnviadas + 1
      };

      // Se é a primeira mensagem, registra tempo
      if (userMetric.totalMensagensEnviadas === 0) {
        const tempoAtePrimeira = now.diff(
          moment(userMetric.startedAt),
          "seconds"
        );
        updates.tempoAtePrimeiraResposta = tempoAtePrimeira;
      }

      await userMetric.update(updates);
      break;

    case "transfer":
      // Finaliza métrica ao transferir
      const tempoTotal = now.diff(moment(userMetric.startedAt), "seconds");

      await userMetric.update({
        finishedAt: now.toDate(),
        tempoTotal,
        foiTransferido: true
      });

      // Incrementa contador de transferências na métrica geral
      const metric = await TicketMetrics.findByPk(userMetric.ticketMetricId);
      if (metric) {
        await metric.update({
          numeroTransferencias: metric.numeroTransferencias + 1
        });
      }
      break;

    case "close":
      // Finaliza métrica ao fechar
      const tempoTotalFinal = now.diff(moment(userMetric.startedAt), "seconds");

      await userMetric.update({
        finishedAt: now.toDate(),
        tempoTotal: tempoTotalFinal,
        finalizouTicket: true
      });
      break;
  }
};

export default UpdateTicketUserMetricsService;
