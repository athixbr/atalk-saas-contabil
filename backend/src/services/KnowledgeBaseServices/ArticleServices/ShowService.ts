import KnowledgeBaseArticle from "../../../models/KnowledgeBaseArticle";
import KnowledgeBaseCategory from "../../../models/KnowledgeBaseCategory";
import KnowledgeBaseTag from "../../../models/KnowledgeBaseTag";
import KnowledgeBaseAttachment from "../../../models/KnowledgeBaseAttachment";
import KnowledgeBaseVideo from "../../../models/KnowledgeBaseVideo";
import KnowledgeBaseComment from "../../../models/KnowledgeBaseComment";
import User from "../../../models/User";
import AppError from "../../../errors/AppError";

interface Request {
  id: string | number;
  companyId: number;
}

const ShowService = async ({ id, companyId }: Request): Promise<KnowledgeBaseArticle> => {
  const article = await KnowledgeBaseArticle.findOne({
    where: { id, companyId },
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
      },
      {
        model: KnowledgeBaseAttachment,
        as: "attachments",
        order: [["order", "ASC"]]
      },
      {
        model: KnowledgeBaseVideo,
        as: "videos",
        order: [["order", "ASC"]]
      },
      {
        model: KnowledgeBaseComment,
        as: "comments",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email"]
          }
        ],
        where: { parentId: null },
        required: false,
        order: [["createdAt", "DESC"]]
      }
    ]
  });

  if (!article) {
    throw new AppError("ERR_ARTICLE_NOT_FOUND", 404);
  }

  return article;
};

export default ShowService;
