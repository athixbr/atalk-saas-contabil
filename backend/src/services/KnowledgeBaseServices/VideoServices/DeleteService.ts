import KnowledgeBaseVideo from "../../../models/KnowledgeBaseVideo";
import KnowledgeBaseArticle from "../../../models/KnowledgeBaseArticle";
import AppError from "../../../errors/AppError";

interface Request {
  id: string | number;
  companyId: number;
}

const DeleteService = async ({ id, companyId }: Request): Promise<void> => {
  const video = await KnowledgeBaseVideo.findOne({
    where: { id },
    include: [
      {
        model: KnowledgeBaseArticle,
        as: "article",
        where: { companyId }
      }
    ]
  });

  if (!video) {
    throw new AppError("ERR_VIDEO_NOT_FOUND", 404);
  }

  await video.destroy();
};

export default DeleteService;
