import EmailLog from "../../models/EmailLog";
import EmailConfig from "../../models/EmailConfig";
import EmailTemplate from "../../models/EmailTemplate";

interface Request {
  companyId: number;
  page?: number;
  limit?: number;
}

const ListEmailLogsService = async ({ companyId, page = 1, limit = 20 }: Request) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await EmailLog.findAndCountAll({
    where: { companyId },
    include: [
      { model: EmailConfig, as: "emailConfig", attributes: ["id", "name", "provider"] },
      { model: EmailTemplate, as: "emailTemplate", attributes: ["id", "title"] },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  return { logs: rows, count, hasMore: offset + rows.length < count };
};

export default ListEmailLogsService;
