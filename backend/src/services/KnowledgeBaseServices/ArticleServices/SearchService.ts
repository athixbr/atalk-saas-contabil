import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import KnowledgeBaseArticle from "../../../models/KnowledgeBaseArticle";
import KnowledgeBaseCategory from "../../../models/KnowledgeBaseCategory";
import KnowledgeBaseTag from "../../../models/KnowledgeBaseTag";
import User from "../../../models/User";

interface Request {
  query: string;
  categoryId?: string;
  companyId: number;
}

const SearchService = async ({
  query,
  categoryId,
  companyId
}: Request): Promise<KnowledgeBaseArticle[]> => {
  let whereCondition: any = {
    companyId,
    status: "published",
    [Op.or]: [
      { title: { [Op.like]: `%${query}%` } },
      { content: { [Op.like]: `%${query}%` } },
      { summary: { [Op.like]: `%${query}%` } }
    ]
  };

  if (categoryId) {
    whereCondition.categoryId = categoryId;
  }

  const articles = await KnowledgeBaseArticle.findAll({
    where: whereCondition,
    limit: 50,
    order: [["views", "DESC"], ["createdAt", "DESC"]],
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

  return articles;
};

export default SearchService;
