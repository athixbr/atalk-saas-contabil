import Checklist from "../../models/Checklist";
import ChecklistItem from "../../models/ChecklistItem";
import User from "../../models/User";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
  ativo?: boolean;
  page?: number;
  pageSize?: number;
}

interface Response {
  checklists: Checklist[];
  count: number;
  hasMore: boolean;
}

const ListChecklistsService = async ({
  companyId,
  searchParam = "",
  ativo,
  page = 1,
  pageSize = 20
}: Request): Promise<Response> => {
  const offset = (page - 1) * pageSize;
  const limit = pageSize;

  const whereCondition: any = {
    companyId
  };

  if (ativo !== undefined) {
    whereCondition.ativo = ativo;
  }

  if (searchParam) {
    whereCondition[Op.or] = [
      { titulo: { [Op.iLike]: `%${searchParam}%` } },
      { descricao: { [Op.iLike]: `%${searchParam}%` } }
    ];
  }

  const { count, rows: checklists } = await Checklist.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: ChecklistItem,
        as: "itens",
        separate: true,
        order: [["ordem", "ASC"]]
      },
      {
        model: User,
        as: "creator",
        attributes: ["id", "name", "email"]
      },
      {
        model: User,
        as: "updater",
        attributes: ["id", "name", "email"]
      }
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]]
  });

  const hasMore = count > offset + checklists.length;

  return {
    checklists,
    count,
    hasMore
  };
};

export default ListChecklistsService;
