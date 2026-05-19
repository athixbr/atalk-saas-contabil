import KnowledgeBaseAttachment from "../../../models/KnowledgeBaseAttachment";
import KnowledgeBaseArticle from "../../../models/KnowledgeBaseArticle";
import AppError from "../../../errors/AppError";

interface Request {
  id: string | number;
  companyId: number;
}

const DeleteService = async ({ id, companyId }: Request): Promise<KnowledgeBaseAttachment> => {
  const attachment = await KnowledgeBaseAttachment.findOne({
    where: { id },
    include: [
      {
        model: KnowledgeBaseArticle,
        as: "article",
        where: { companyId }
      }
    ]
  });

  if (!attachment) {
    throw new AppError("ERR_ATTACHMENT_NOT_FOUND", 404);
  }

  await attachment.destroy();

  return attachment;
};

export default DeleteService;
