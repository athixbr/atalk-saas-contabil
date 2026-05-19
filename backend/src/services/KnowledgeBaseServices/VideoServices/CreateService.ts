import KnowledgeBaseVideo from "../../../models/KnowledgeBaseVideo";
import KnowledgeBaseArticle from "../../../models/KnowledgeBaseArticle";
import AppError from "../../../errors/AppError";

interface Request {
  articleId: string | number;
  videoUrl: string;
  videoType?: string;
  thumbnail?: string;
  title?: string;
  order?: number;
  companyId: number;
}

const CreateService = async ({
  articleId,
  videoUrl,
  videoType = "youtube",
  thumbnail,
  title,
  order,
  companyId
}: Request): Promise<KnowledgeBaseVideo> => {
  
  // Verificar se o artigo existe e pertence à empresa
  const article = await KnowledgeBaseArticle.findOne({
    where: { id: articleId, companyId }
  });

  if (!article) {
    throw new AppError("ERR_ARTICLE_NOT_FOUND", 404);
  }

  // Se não forneceu ordem, pegar a próxima
  let videoOrder = order;
  if (videoOrder === undefined) {
    const lastVideo = await KnowledgeBaseVideo.findOne({
      where: { articleId },
      order: [["order", "DESC"]]
    });
    videoOrder = lastVideo ? lastVideo.order + 1 : 0;
  }

  const video = await KnowledgeBaseVideo.create({
    articleId,
    videoUrl,
    videoType,
    thumbnail,
    title,
    order: videoOrder
  });

  return video;
};

export default CreateService;
