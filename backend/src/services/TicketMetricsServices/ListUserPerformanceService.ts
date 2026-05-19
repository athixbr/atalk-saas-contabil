import __cjs_sequelize from "sequelize";
const { Op, literal } = __cjs_sequelize;
import TicketUserMetrics from "../../models/TicketUserMetrics";
import User from "../../models/User";
import moment from "moment";
import Sequelize from "sequelize";
interface Request {
  companyId: number;
  dateStart?: string;
  dateEnd?: string;
  userId?: number;
}

interface UserPerformance {
  userId: number;
  userName: string;
  totalTicketsAtendidos: number;
  tempoMedioAtendimento: number;
  ticketMaisRapido: number;
  ticketMaisLento: number;
  totalTransferencias: number;
  percentualTransferencias: number;
  totalFinalizados: number;
  taxaResolucao: number;
  totalMensagens: number;
  mediaMensagensPorTicket: number;
  tempoMedioResposta: number;
}

const ListUserPerformanceService = async ({
  companyId,
  dateStart,
  dateEnd,
  userId
}: Request): Promise<UserPerformance[]> => {
  const whereCondition: any = {
    companyId,
    finishedAt: { [Op.ne]: null }
  };

  // Filtro por data
  if (dateStart && dateEnd) {
    whereCondition.startedAt = {
      [Op.between]: [
        moment(dateStart).startOf("day").toDate(),
        moment(dateEnd).endOf("day").toDate()
      ]
    };
  }

  // Filtro por usuário específico
  if (userId) {
    whereCondition.userId = userId;
  }

  // Busca métricas agrupadas por usuário
  const userMetrics = await TicketUserMetrics.findAll({
    where: whereCondition,
    attributes: [
      "userId",
      [literal("COUNT(*)"), "totalTickets"],
      [literal('AVG("TicketUserMetrics"."tempoTotal")'), "tempoMedio"],
      [literal('MIN("TicketUserMetrics"."tempoTotal")'), "tempoMin"],
      [literal('MAX("TicketUserMetrics"."tempoTotal")'), "tempoMax"],
      [literal('SUM(CASE WHEN "TicketUserMetrics"."foiTransferido" = true THEN 1 ELSE 0 END)'), "totalTransf"],
      [literal('SUM(CASE WHEN "TicketUserMetrics"."finalizouTicket" = true THEN 1 ELSE 0 END)'), "totalFinaliz"],
      [literal('SUM("TicketUserMetrics"."totalMensagensEnviadas")'), "totalMsg"],
      [literal('AVG("TicketUserMetrics"."tempoMedioResposta")'), "mediaResp"]
    ],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      }
    ],
    group: ["userId", "user.id", "user.name"],
    raw: false
  });

  // Formata resultado
  const performance: UserPerformance[] = userMetrics.map((metric: any) => {
    const totalTickets = parseInt(metric.get("totalTickets") as string);
    const totalTransf = parseInt(metric.get("totalTransf") as string);
    const totalFinaliz = parseInt(metric.get("totalFinaliz") as string);
    const totalMsg = parseInt(metric.get("totalMsg") as string);

    return {
      userId: metric.userId,
      userName: metric.user?.name || "Usuário Removido",
      totalTicketsAtendidos: totalTickets,
      tempoMedioAtendimento: Math.round(parseFloat(metric.get("tempoMedio") as string) || 0),
      ticketMaisRapido: Math.round(parseFloat(metric.get("tempoMin") as string) || 0),
      ticketMaisLento: Math.round(parseFloat(metric.get("tempoMax") as string) || 0),
      totalTransferencias: totalTransf,
      percentualTransferencias: totalTickets > 0 ? Math.round((totalTransf / totalTickets) * 100) : 0,
      totalFinalizados: totalFinaliz,
      taxaResolucao: totalTickets > 0 ? Math.round((totalFinaliz / totalTickets) * 100) : 0,
      totalMensagens: totalMsg,
      mediaMensagensPorTicket: totalTickets > 0 ? Math.round(totalMsg / totalTickets) : 0,
      tempoMedioResposta: Math.round(parseFloat(metric.get("mediaResp") as string) || 0)
    };
  });

  // Ordena por tempo médio (mais rápido primeiro)
  return performance.sort((a, b) => a.tempoMedioAtendimento - b.tempoMedioAtendimento);
};

export default ListUserPerformanceService;
