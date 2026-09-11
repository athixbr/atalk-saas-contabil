// @ts-ignore
// @ts-ignore
// @ts-ignore
import { Sequelize, Op } from "sequelize";
import Queue from "../../models/Queue";
import Company from "../../models/Company";
import User from "../../models/User";
import Plan from "../../models/Plan";
import Ticket from "../../models/Ticket";
import Departamento from "../../models/Departamento";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
  profile?: string;
  companyId?: number;
  orderBy?: string;
  order?: string;
}

interface Response {
  users: User[];
  count: number;
  hasMore: boolean;
}

const ListUsersService = async ({
  searchParam = "",
  pageNumber = "1",
  companyId,
  orderBy = "createdAt",
  order = "DESC"
}: Request): Promise<Response> => {
  const allowedOrderFields = [
    "id",
    "name",
    "email",
    "profile",
    "online",
    "isActive",
    "startWork",
    "endWork",
    "createdAt",
    "updatedAt"
  ];
  const safeOrderBy = allowedOrderFields.includes(orderBy) ? orderBy : "createdAt";
  const safeOrder = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";

  const whereCondition = {
    [Op.or]: [
      {
        "$User.name$": Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("User.name")),
          "LIKE",
          `%${searchParam.toLowerCase()}%`
        )
      },
      { email: { [Op.like]: `%${searchParam.toLowerCase()}%` } }
    ],
    companyId: {
      [Op.eq]: companyId
    }
  };

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: users } = await User.findAndCountAll({
    where: whereCondition,
    //attributes: ["name", "id", "email", "companyId", "profile", "createdAt", "online", "startWork", "endWork", "farewellMessage","allTicket"],
    limit,
    offset,
    order: [[safeOrderBy, safeOrder]],
    include: [
      { model: Queue, as: "queues", attributes: ["id", "name", "color"] },
      {
        model: Company,
        as: "company",
        attributes: ["id", "name", "dueDate", "document"],
        include: [
          {
            model: Plan, as: "plan",
            attributes: ["id",
              "name",
              "amount",
              "useWhatsapp",
              "useFacebook",
              "useInstagram",
              "useCampaigns",
              "useSchedules",
              "useInternalChat",
              "useExternalApi"]
          },
        ]
      },
      { model: Ticket, as: "tickets"},
      {
        model: Departamento,
        as: "departamentos",
        attributes: ["id", "nome"],
        through: { attributes: ["isCoordenador"] }
      }
    ]
  });

  const hasMore = count > offset + users.length;

  return {
    users,
    count,
    hasMore
  };
};

export default ListUsersService;
