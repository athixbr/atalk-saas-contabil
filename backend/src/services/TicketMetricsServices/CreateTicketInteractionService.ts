import TicketInteractions from "../../models/TicketInteractions";
import moment from "moment";

interface Request {
  ticketId: number;
  userId?: number;
  companyId: number;
  type: "view" | "message" | "transfer" | "queue_change" | "close" | "reopen" | "accept";
  previousUserId?: number;
  newUserId?: number;
  previousQueueId?: number;
  newQueueId?: number;
  messageId?: string;
  metadata?: object;
}

const CreateTicketInteractionService = async ({
  ticketId,
  userId,
  companyId,
  type,
  previousUserId,
  newUserId,
  previousQueueId,
  newQueueId,
  messageId,
  metadata
}: Request): Promise<TicketInteractions> => {
  // Busca última interação para calcular tempo
  const lastInteraction = await TicketInteractions.findOne({
    where: { ticketId },
    order: [["timestamp", "DESC"]]
  });

  const now = moment();
  let tempoDesdeUltima = 0;

  if (lastInteraction) {
    tempoDesdeUltima = now.diff(moment(lastInteraction.timestamp), "seconds");
  }

  // Cria nova interação
  const interaction = await TicketInteractions.create({
    ticketId,
    userId,
    companyId,
    type,
    previousUserId,
    newUserId,
    previousQueueId,
    newQueueId,
    messageId,
    timestamp: now.toDate(),
    tempoDesdeUltimaInteracao: tempoDesdeUltima,
    metadata
  });

  return interaction;
};

export default CreateTicketInteractionService;
