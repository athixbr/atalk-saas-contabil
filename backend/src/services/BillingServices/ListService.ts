import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import Billing from "../../models/Billing";
import Contact from "../../models/Contact";
import User from "../../models/User";

interface Request {
  searchParam?: string;
  status?: string;
  contactId?: number | string;
  pageNumber?: string | number;
  companyId: number | string;
  startDate?: string;
  endDate?: string;
}

interface Response {
  billings: Billing[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  searchParam = "",
  status = "",
  contactId = "",
  pageNumber = "1",
  companyId,
  startDate,
  endDate
}: Request): Promise<Response> => {
  const whereCondition: any = {
    companyId
  };

  if (searchParam) {
    whereCondition[Op.or] = [
      { clientName: { [Op.like]: `%${searchParam}%` } },
      { tradeName: { [Op.like]: `%${searchParam}%` } },
      { contractNumber: { [Op.like]: `%${searchParam}%` } }
    ];
  }

  if (status && status !== "") {
    whereCondition.status = status;
  }

  if (contactId && contactId !== "") {
    whereCondition.contactId = contactId;
  }

  if (startDate && endDate) {
    whereCondition.dueDate = {
      [Op.between]: [startDate, endDate]
    };
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: billings } = await Billing.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [
      ["dueDate", "ASC"],
      ["createdAt", "DESC"]
    ],
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number"]
      },
      {
        model: User,
        as: "creator",
        attributes: ["id", "name"]
      },
      {
        model: User,
        as: "updater",
        attributes: ["id", "name"]
      }
    ]
  });

  const hasMore = count > offset + billings.length;

  return {
    billings,
    count,
    hasMore
  };
};

export default ListService;
