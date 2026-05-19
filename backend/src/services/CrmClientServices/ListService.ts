import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import CrmClient from "../../models/CrmClient";
import User from "../../models/User";
import CrmBusinessType from "../../models/CrmBusinessType";
import CrmTaxRegime from "../../models/CrmTaxRegime";

interface Request {
  companyId: number;
  userId?: number;
  status?: string;
  searchParam?: string;
  businessTypeId?: number;
  taxRegimeId?: number;
  pageNumber?: string | number;
}

interface Response {
  clients: CrmClient[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  companyId,
  userId,
  status,
  searchParam,
  businessTypeId,
  taxRegimeId,
  pageNumber = "1"
}: Request): Promise<Response> => {
  const whereCondition: any = {
    companyId
  };

  if (userId) {
    whereCondition.userId = userId;
  }

  if (status) {
    whereCondition.status = status;
  }

  if (businessTypeId) {
    whereCondition.businessTypeId = businessTypeId;
  }

  if (taxRegimeId) {
    whereCondition.taxRegimeId = taxRegimeId;
  }

  if (searchParam) {
    whereCondition[Op.or] = [
      { name: { [Op.like]: `%${searchParam}%` } },
      { companyName: { [Op.like]: `%${searchParam}%` } },
      { cnpj: { [Op.like]: `%${searchParam}%` } },
      { phone: { [Op.like]: `%${searchParam}%` } },
      { whatsapp: { [Op.like]: `%${searchParam}%` } },
      { email: { [Op.like]: `%${searchParam}%` } }
    ];
  }

  const limit = 20;
  const offset = limit * (parseInt(pageNumber.toString()) - 1);

  const { count, rows: clients } = await CrmClient.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      { model: User, as: "user", attributes: ["id", "name"] },
      { model: CrmBusinessType, as: "businessType", attributes: ["id", "name"] },
      { model: CrmTaxRegime, as: "taxRegime", attributes: ["id", "name"] }
    ]
  });

  const hasMore = count > offset + clients.length;

  return {
    clients,
    count,
    hasMore
  };
};

export default ListService;
