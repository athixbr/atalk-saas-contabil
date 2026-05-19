import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import KnowledgeBaseCategory from "../../../models/KnowledgeBaseCategory";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
  companyId: number;
}

interface Response {
  categories: KnowledgeBaseCategory[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  searchParam,
  pageNumber = "1",
  companyId
}: Request): Promise<Response> => {
  let whereCondition: any = {
    isActive: true
  };

  if (searchParam) {
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        { name: { [Op.like]: `%${searchParam}%` } },
        { description: { [Op.like]: `%${searchParam}%` } }
      ]
    };
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: categories } = await KnowledgeBaseCategory.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["order", "ASC"], ["name", "ASC"]],
    include: [
      {
        model: KnowledgeBaseCategory,
        as: "children",
        required: false
      }
    ]
  });

  const hasMore = count > offset + categories.length;

  return {
    categories,
    count,
    hasMore
  };
};

export default ListService;
