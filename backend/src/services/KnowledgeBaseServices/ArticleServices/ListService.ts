import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import KnowledgeBaseArticle from "../../../models/KnowledgeBaseArticle";
import KnowledgeBaseCategory from "../../../models/KnowledgeBaseCategory";
import KnowledgeBaseTag from "../../../models/KnowledgeBaseTag";
import User from "../../../models/User";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
  categoryId?: string;
  status?: string;
  userId?: string;
  featured?: boolean;
  companyId: number;
}

interface Response {
  articles: KnowledgeBaseArticle[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  searchParam,
  pageNumber = "1",
  categoryId,
  status,
  userId,
  featured,
  companyId
}: Request): Promise<Response> => {
  let whereCondition: any = {
    companyId
  };

  if (searchParam) {
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        { title: { [Op.like]: `%${searchParam}%` } },
        { content: { [Op.like]: `%${searchParam}%` } },
        { summary: { [Op.like]: `%${searchParam}%` } }
      ]
    };
  }

  if (categoryId) {
    whereCondition.categoryId = categoryId;
  }

  if (status) {
    whereCondition.status = status;
  } else {
    // Por padrão, mostrar apenas publicados
    whereCondition.status = "published";
  }

  if (userId) {
    whereCondition.userId = userId;
  }

  if (featured !== undefined) {
    whereCondition.featured = featured;
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: articles } = await KnowledgeBaseArticle.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: KnowledgeBaseCategory,
        as: "category",
        attributes: ["id", "name", "slug", "icon", "color"]
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"]
      },
      {
        model: KnowledgeBaseTag,
        as: "tags",
        attributes: ["id", "name", "slug", "color"],
        through: { attributes: [] }
      }
    ]
  });

  const hasMore = count > offset + articles.length;

  return {
    articles,
    count,
    hasMore
  };
};

export default ListService;
