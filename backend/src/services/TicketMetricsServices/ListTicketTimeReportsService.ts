import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import TicketMetrics from "../../models/TicketMetrics";
import TicketUserMetrics from "../../models/TicketUserMetrics";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Queue from "../../models/Queue";
import moment from "moment";

interface Request {
  companyId: number;
  dateStart?: string;
  dateEnd?: string;
  userId?: number;
  queueId?: number;
  status?: string;
}

interface TicketTimeReport {
  ticketId: number;
  ticketNumber: number;
  contactName: string;
  contactNumber: string;
  status: string;
  createdAt: Date;
  closedAt: Date | null;
  tempoEsperaInicial: number;
  tempoAtePrimeiraResposta: number;
  tempoTotalAtendimento: number;
  tempoOcioso: number;
  tempoAtivo: number;
  numeroTransferencias: number;
  totalMensagensUsuario: number;
  totalMensagensCliente: number;
  usuariosAtendentes: Array<{
    userId: number;
    userName: string;
    queueName: string;
    order: number;
    startedAt: Date;
    finishedAt: Date | null;
    tempoTotal: number;
    totalMensagens: number;
    foiTransferido: boolean;
    finalizouTicket: boolean;
  }>;
}

const ListTicketTimeReportsService = async ({
  companyId,
  dateStart,
  dateEnd,
  userId,
  queueId,
  status
}: Request): Promise<TicketTimeReport[]> => {
  const whereMetrics: any = {
    companyId
  };

  // Filtro por data
  if (dateStart && dateEnd) {
    whereMetrics.createdAt = {
      [Op.between]: [
        moment(dateStart).startOf("day").toDate(),
        moment(dateEnd).endOf("day").toDate()
      ]
    };
  }

  // Filtro por status (se não especificado, mostra todos exceto deleted)
  if (status) {
    whereMetrics.status = status;
  } else {
    // Mostra todos os tickets (abertos, pendentes, fechados)
    // Não filtra por status para mostrar em tempo real
  }

  // Busca métricas
  const metrics = await TicketMetrics.findAll({
    where: whereMetrics,
    include: [
      {
        model: Ticket,
        as: "ticket",
        required: true,
        include: [
          {
            model: Contact,
            as: "contact",
            attributes: ["id", "name", "number"]
          }
        ]
      },
      {
        model: TicketUserMetrics,
        as: "userMetrics",
        required: false,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name"]
          },
          {
            model: Queue,
            as: "queue",
            attributes: ["id", "name"]
          }
        ],
        where: userId ? { userId } : {},
        order: [["order", "ASC"]]
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  // Formata resultado
  const reports: TicketTimeReport[] = metrics.map((metric: any) => {
    const usuariosAtendentes = metric.userMetrics.map((um: any) => ({
      userId: um.userId,
      userName: um.user?.name || "Usuário Removido",
      queueName: um.queue?.name || "Sem fila",
      order: um.order,
      startedAt: um.startedAt,
      finishedAt: um.finishedAt,
      tempoTotal: um.tempoTotal,
      totalMensagens: um.totalMensagensEnviadas,
      foiTransferido: um.foiTransferido,
      finalizouTicket: um.finalizouTicket
    }));

    return {
      ticketId: metric.ticketId,
      ticketNumber: metric.ticket.id,
      contactName: metric.ticket.contact?.name || "Sem nome",
      contactNumber: metric.ticket.contact?.number || "",
      status: metric.status,
      createdAt: metric.createdAt,
      closedAt: metric.closedAt,
      tempoEsperaInicial: metric.tempoEsperaInicial,
      tempoAtePrimeiraResposta: metric.tempoAtePrimeiraResposta,
      tempoTotalAtendimento: metric.tempoTotalAtendimento,
      tempoOcioso: metric.tempoOcioso,
      tempoAtivo: metric.tempoAtivo,
      numeroTransferencias: metric.numeroTransferencias,
      totalMensagensUsuario: metric.totalMensagensUsuario,
      totalMensagensCliente: metric.totalMensagensCliente,
      usuariosAtendentes
    };
  });

  return reports;
};

export default ListTicketTimeReportsService;
