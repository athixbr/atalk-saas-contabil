import WhatsappLog from "../../models/WhatsappLog";
import Whatsapp from "../../models/Whatsapp";
import WhatsappTemplate from "../../models/WhatsappTemplate";

interface Request {
  companyId: number;
  page?: number;
  limit?: number;
}

const ListWhatsappLogsService = async ({ companyId, page = 1, limit = 20 }: Request) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await WhatsappLog.findAndCountAll({
    where: { companyId },
    include: [
      { model: Whatsapp, as: "whatsapp", attributes: ["id", "name", "number"] },
      { model: WhatsappTemplate, as: "whatsappTemplate", attributes: ["id", "title"] }
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset
  });

  return { whatsappLogs: rows, count, pages: Math.ceil(count / limit) };
};

export default ListWhatsappLogsService;
