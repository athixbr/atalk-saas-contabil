import KnowledgeBaseArticle from "../../../models/KnowledgeBaseArticle";
import KnowledgeBaseCategory from "../../../models/KnowledgeBaseCategory";
import KnowledgeBaseTag from "../../../models/KnowledgeBaseTag";
import User from "../../../models/User";

interface Request {
  companyId: number;
}

const FeaturedService = async ({
  companyId
}: Request): Promise<KnowledgeBaseArticle[]> => {
  const articles = await KnowledgeBaseArticle.findAll({
    where: {
      companyId,
      status: "published",
      featured: true
    },
    limit: 10,
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

export default FeaturedService;
