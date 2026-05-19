import KnowledgeBaseAttachment from "../../../models/KnowledgeBaseAttachment";
import KnowledgeBaseArticle from "../../../models/KnowledgeBaseArticle";
import AppError from "../../../errors/AppError";

interface Request {
  articleId: string | number;
  fileName: string;
  fileType: "image" | "video" | "document";
  filePath: string;
  fileSize: number;
  mimeType: string;
  companyId: number;
}

const CreateService = async ({
  articleId,
  fileName,
  fileType,
  filePath,
  fileSize,
  mimeType,
  companyId
}: Request): Promise<KnowledgeBaseAttachment> => {
  
  // Verificar se o artigo existe e pertence à empresa
  const article = await KnowledgeBaseArticle.findOne({
    where: { id: articleId, companyId }
  });

  if (!article) {
    throw new AppError("ERR_ARTICLE_NOT_FOUND", 404);
  }

  // Obter a ordem do próximo anexo
  const lastAttachment = await KnowledgeBaseAttachment.findOne({
    where: { articleId },
    order: [["order", "DESC"]]
  });

  const order = lastAttachment ? lastAttachment.order + 1 : 0;

  const attachment = await KnowledgeBaseAttachment.create({
    articleId,
    fileName,
    fileType,
    filePath,
    fileSize,
    mimeType,
    order
  });

  return attachment;
};

export default CreateService;
