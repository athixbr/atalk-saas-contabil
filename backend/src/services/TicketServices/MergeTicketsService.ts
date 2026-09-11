import { getIO } from "../../libs/socket";
import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import CreateLogTicketService from "./CreateLogTicketService";

interface Request {
  masterTicketId: number;
  mergedTicketId: number;
  contactName: string;
  contactNumber: string;
  companyId: number;
  userId: number;
}

const MergeTicketsService = async ({
  masterTicketId,
  mergedTicketId,
  contactName,
  contactNumber,
  companyId,
  userId
}: Request): Promise<Ticket> => {
  if (masterTicketId === mergedTicketId) {
    throw new AppError("ERR_MERGE_SAME_TICKET", 400);
  }

  const [masterTicket, mergedTicket] = await Promise.all([
    Ticket.findOne({ where: { id: masterTicketId, companyId } }),
    Ticket.findOne({ where: { id: mergedTicketId, companyId } })
  ]);

  if (!masterTicket) throw new AppError("ERR_NO_TICKET_FOUND", 404);
  if (!mergedTicket) throw new AppError("ERR_NO_TICKET_FOUND", 404);
  if (mergedTicket.isMerged) throw new AppError("ERR_TICKET_ALREADY_MERGED", 400);

  // Atualiza o contato do ticket master com nome/número confirmado pelo usuário
  const masterContact = await Contact.findOne({
    where: { id: masterTicket.contactId, companyId }
  });

  if (masterContact) {
    await masterContact.update({ name: contactName, number: contactNumber });
  }

  // Carrega o nome do contato do ticket incorporado antes de transferir
  const mergedContact = await Contact.findOne({
    where: { id: mergedTicket.contactId, companyId }
  });
  const mergedContactName = mergedContact?.name || `Ticket #${mergedTicketId}`;

  // Busca a mensagem mais antiga do ticket incorporado para posicionar o separador
  const oldestMergedMessage = await Message.findOne({
    where: { ticketId: mergedTicketId },
    order: [["createdAt", "ASC"]]
  });

  // Transfere todas as mensagens do ticket incorporado para o master
  await Message.update(
    { ticketId: masterTicketId },
    { where: { ticketId: mergedTicketId } }
  );

  // Insere mensagem-separador logo antes das mensagens incorporadas
  if (oldestMergedMessage) {
    const separatorTime = new Date(
      new Date(oldestMergedMessage.createdAt).getTime() - 1000
    );

    await Message.create({
      wid: `MERGE_${masterTicketId}_${mergedTicketId}_${Date.now()}`,
      ticketId: masterTicketId,
      companyId,
      body: `--- mensagens incorporadas de ${mergedContactName} ---`,
      mediaType: "merge_separator",
      fromMe: false,
      read: true,
      ack: 2,
      createdAt: separatorTime,
      updatedAt: separatorTime
    } as any);
  }

  // Oculta o ticket incorporado
  await mergedTicket.update({
    isMerged: true,
    mergedIntoTicketId: masterTicketId,
    status: "closed"
  });

  // Recarrega o ticket master com dados atualizados
  await masterTicket.reload({
    include: [
      { model: Contact, as: "contact" }
    ]
  });

  // Log de merge no ticket master
  await CreateLogTicketService({
    userId,
    ticketId: masterTicketId,
    type: "merge" as any
  });

  // Log no ticket incorporado
  await CreateLogTicketService({
    userId,
    ticketId: mergedTicketId,
    type: "merge" as any
  });

  const io = getIO();

  // Remove o ticket incorporado da lista de todos os usuários
  io.to(mergedTicket.status)
    .to(mergedTicketId.toString())
    .emit(`company-${companyId}-ticket`, {
      action: "delete",
      ticketId: mergedTicketId
    });

  // Atualiza o ticket master na lista
  io.to(masterTicket.status)
    .to(masterTicketId.toString())
    .emit(`company-${companyId}-ticket`, {
      action: "update",
      ticket: masterTicket
    });

  return masterTicket;
};

export default MergeTicketsService;
