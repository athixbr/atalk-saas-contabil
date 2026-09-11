import { Op, fn, where, col } from "sequelize";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Queue from "../../models/Queue";
import removeAccents from "remove-accents";

interface Request {
  companyId: number;
  searchParam?: string;
  mediaType?: string; // "text" | "image" | "video" | "audio" | "application" | "all"
  pageNumber?: string;
}

interface MessageResult {
  id: number;
  body: string;
  mediaUrl: string | null;
  mediaType: string | null;
  createdAt: Date;
  ticketId: number;
  ticketStatus: string;
  contactId: number;
  contactName: string;
  contactNumber: string;
  contactProfilePicUrl: string | null;
  queueName: string | null;
}

interface Response {
  messages: MessageResult[];
  count: number;
  hasMore: boolean;
}

const SearchMessagesService = async ({
  companyId,
  searchParam = "",
  mediaType = "all",
  pageNumber = "1",
}: Request): Promise<Response> => {
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const whereCondition: any = {
    "$ticket.companyId$": companyId,
    isDeleted: false,
  };

  // Filter by media type
  if (mediaType === "text") {
    whereCondition.mediaType = {
      [Op.or]: [null, "conversation", "extendedTextMessage", ""],
    };
    whereCondition.mediaUrl = { [Op.eq]: null };
  } else if (mediaType === "image") {
    whereCondition.mediaType = "image";
  } else if (mediaType === "video") {
    whereCondition.mediaType = "video";
  } else if (mediaType === "audio") {
    whereCondition.mediaType = { [Op.in]: ["audio", "ptt"] };
  } else if (mediaType === "application") {
    whereCondition.mediaType = "application";
  } else if (mediaType === "media") {
    // All media types (non-text)
    whereCondition.mediaUrl = { [Op.ne]: null };
    whereCondition.mediaType = {
      [Op.notIn]: ["conversation", "extendedTextMessage", "locationMessage", "contactMessage", "call_log"],
    };
  }

  // Text search in body
  if (searchParam && searchParam.trim().length > 0) {
    const sanitized = removeAccents(searchParam.toLocaleLowerCase().trim());
    whereCondition.body = where(
      fn("LOWER", fn("unaccent", col("Message.body"))),
      "LIKE",
      `%${sanitized}%`
    );
  }

  const { count, rows: messages } = await Message.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: Ticket,
        as: "ticket",
        required: true,
        where: { companyId },
        include: [
          {
            model: Contact,
            as: "contact",
            attributes: ["id", "name", "number", "profilePicUrl"],
          },
          {
            model: Queue,
            as: "queue",
            attributes: ["id", "name"],
            required: false,
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  const hasMore = count > offset + messages.length;

  const result: MessageResult[] = messages.map((msg) => ({
    id: msg.id,
    body: msg.body,
    mediaUrl: msg.mediaUrl,
    mediaType: msg.mediaType,
    createdAt: msg.createdAt,
    ticketId: msg.ticketId,
    ticketStatus: (msg as any).ticket?.status ?? "",
    contactId: (msg as any).ticket?.contact?.id ?? null,
    contactName: (msg as any).ticket?.contact?.name ?? "",
    contactNumber: (msg as any).ticket?.contact?.number ?? "",
    contactProfilePicUrl: (msg as any).ticket?.contact?.profilePicUrl ?? null,
    queueName: (msg as any).ticket?.queue?.name ?? null,
  }));

  return { messages: result, count, hasMore };
};

export default SearchMessagesService;
