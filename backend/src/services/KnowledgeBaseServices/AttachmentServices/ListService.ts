import KnowledgeBaseAttachment from "../../../models/KnowledgeBaseAttachment";
import KnowledgeBaseArticle from "../../../models/KnowledgeBaseArticle";
import AppError from "../../../errors/AppError";

interface Request {
  articleId: string | number;
  companyId: number;
}

const ListService = async ({
  articleId,
  companyId
}: Request): Promise<KnowledgeBaseAttachment[]> => {
  
  // Verificar se o artigo existe e pertence à empresa
  const article = await KnowledgeBaseArticle.findOne({
    where: { id: articleId, companyId }
  });

  if (!article) {
    throw new AppError("ERR_ARTICLE_NOT_FOUND", 404);
  }

  const attachments = await KnowledgeBaseAttachment.findAll({
    where: { articleId },
    order: [["order", "ASC"]]
  });

  return attachments;
};

export default ListService;
