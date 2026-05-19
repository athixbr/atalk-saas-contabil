import TicketMetrics from "../../models/TicketMetrics";
import moment from "moment";

interface Request {
  ticketId: number;
  type: "first_view" | "first_message" | "client_message" | "user_message" | "close";
  userId?: number;
  messageId?: string;
}

const UpdateTicketMetricsService = async ({
  ticketId,
  type,
  userId,
  messageId
}: Request): Promise<void> => {
  const metric = await TicketMetrics.findOne({
    where: { ticketId }
  });

  if (!metric) {
    return;
  }

  const now = moment();

  switch (type) {
    case "first_view":
      // Primeira visualização do ticket
      if (!metric.firstResponseAt) {
        const tempoEspera = now.diff(moment(metric.createdAt), "seconds");
        await metric.update({
          firstResponseAt: now.toDate(),
          tempoEsperaInicial: tempoEspera
        });
      }
      break;

    case "first_message":
      // Primeira mensagem enviada pelo atendente
      if (!metric.firstInteractionAt) {
        const tempoResposta = now.diff(moment(metric.createdAt), "seconds");
        await metric.update({
          firstInteractionAt: now.toDate(),
          tempoAtePrimeiraResposta: tempoResposta,
          ultimaInteracaoUsuarioAt: now.toDate()
        });
      }
      break;

    case "user_message":
      // Mensagem do atendente
      await metric.update({
        totalMensagensUsuario: metric.totalMensagensUsuario + 1,
        ultimaInteracaoUsuarioAt: now.toDate()
      });

      // Calcula tempo ocioso (se houve mensagem do cliente antes)
      if (metric.ultimaInteracaoClienteAt) {
        const tempoOcioso = now.diff(
          moment(metric.ultimaInteracaoClienteAt),
          "seconds"
        );
        if (tempoOcioso > 60) {
          // Só conta se passou mais de 1 minuto
          await metric.update({
            tempoOcioso: metric.tempoOcioso + tempoOcioso
          });
        }
      }
      break;

    case "client_message":
      // Mensagem do cliente
      await metric.update({
        totalMensagensCliente: metric.totalMensagensCliente + 1,
        ultimaInteracaoClienteAt: now.toDate()
      });
      break;

    case "close":
      // Fechamento do ticket
      const tempoTotal = now.diff(moment(metric.createdAt), "seconds");
      const tempoAtivo = tempoTotal - metric.tempoOcioso - metric.tempoEsperaInicial;

      await metric.update({
        closedAt: now.toDate(),
        tempoTotalAtendimento: tempoTotal,
        tempoAtivo: tempoAtivo > 0 ? tempoAtivo : 0,
        status: "closed"
      });
      break;
  }

  // Atualiza tempo desde última interação
  if (metric.ultimaInteracaoClienteAt && metric.ultimaInteracaoUsuarioAt) {
    const ultimaInteracao = moment.max(
      moment(metric.ultimaInteracaoClienteAt),
      moment(metric.ultimaInteracaoUsuarioAt)
    );
    const tempoDesdeUltima = now.diff(ultimaInteracao, "seconds");
    await metric.update({
      tempoDesdeUltimaInteracao: tempoDesdeUltima
    });
  }
};

export default UpdateTicketMetricsService;
