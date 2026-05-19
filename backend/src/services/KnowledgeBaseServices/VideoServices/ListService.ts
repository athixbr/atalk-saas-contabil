import KnowledgeBaseVideo from "../../../models/KnowledgeBaseVideo";
import KnowledgeBaseArticle from "../../../models/KnowledgeBaseArticle";
import AppError from "../../../errors/AppError";

interface Request {
  articleId: string | number;
  companyId: number;
}

const ListService = async ({
  articleId,
  companyId
}: Request): Promise<KnowledgeBaseVideo[]> => {
  
  // Verificar se o artigo existe e pertence à empresa
  const article = await KnowledgeBaseArticle.findOne({
    where: { id: articleId, companyId }
  });

  if (!article) {
    throw new AppError("ERR_ARTICLE_NOT_FOUND", 404);
  }

  const videos = await KnowledgeBaseVideo.findAll({
    where: { articleId },
    order: [["order", "ASC"]]
  });

  return videos;
};

export default ListService;
