import KnowledgeBaseArticle from "../../../models/KnowledgeBaseArticle";
import AppError from "../../../errors/AppError";

interface Request {
  id: string | number;
  companyId: number;
}

const IncrementViewService = async ({ id, companyId }: Request): Promise<void> => {
  const article = await KnowledgeBaseArticle.findOne({
    where: { id, companyId }
  });

  if (!article) {
    throw new AppError("ERR_ARTICLE_NOT_FOUND", 404);
  }

  await article.increment("views", { by: 1 });
};

export default IncrementViewService;
