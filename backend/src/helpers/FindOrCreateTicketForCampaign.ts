import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import Ticket from "../models/Ticket";
import Contact from "../models/Contact";
import Whatsapp from "../models/Whatsapp";

interface Request {
  contactId: number;
  whatsappId: number;
  companyId: number;
}

const FindOrCreateTicketForCampaign = async ({
  contactId,
  whatsappId,
  companyId,
}: Request): Promise<Ticket> => {
  // Buscar ticket aberto (open ou pending) do contato
  let ticket = await Ticket.findOne({
    where: {
      contactId,
      whatsappId,
      companyId,
      status: {
        [Op.in]: ["open", "pending"]
      }
    },
    include: [
      { model: Contact, as: "contact" },
      { model: Whatsapp, as: "whatsapp" }
    ]
  });

  // Se não encontrou ticket aberto, criar novo fechado
  if (!ticket) {
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    
    ticket = await Ticket.create({
      contactId,
      whatsappId,
      companyId,
      status: "closed", // Fecha automaticamente por ser campanha
      queueId: whatsapp?.queues?.[0]?.id || null, // Fila padrão da conexão
      userId: null, // Sem usuário atribuído
      isGroup: false,
    });

    // Recarregar com includes
    ticket = await Ticket.findByPk(ticket.id, {
      include: [
        { model: Contact, as: "contact" },
        { model: Whatsapp, as: "whatsapp" }
      ]
    });
  }

  return ticket;
};

export default FindOrCreateTicketForCampaign;
