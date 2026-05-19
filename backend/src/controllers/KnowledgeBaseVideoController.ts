import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";

import CreateService from "../services/KnowledgeBaseServices/VideoServices/CreateService";
import DeleteService from "../services/KnowledgeBaseServices/VideoServices/DeleteService";
import ListService from "../services/KnowledgeBaseServices/VideoServices/ListService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { articleId } = req.params;
  const { videoUrl, videoType, thumbnail, title, order } = req.body;
  const { companyId } = req.user;

  if (!videoUrl) {
    throw new AppError("ERR_VIDEO_URL_REQUIRED", 400);
  }

  const video = await CreateService({
    articleId,
    videoUrl,
    videoType,
    thumbnail,
    title,
    order,
    companyId
  });

  const io = getIO();
  io.emit(`company${companyId}-knowledgeBaseVideo`, {
    action: "create",
    video
  });

  return res.status(200).json(video);
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { articleId } = req.params;
  const { companyId } = req.user;

  const videos = await ListService({ articleId, companyId });

  return res.json({ videos });
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { videoId } = req.params;
  const { companyId } = req.user;

  await DeleteService({ id: videoId, companyId });

  const io = getIO();
  io.emit(`company${companyId}-knowledgeBaseVideo`, {
    action: "delete",
    videoId
  });

  return res.status(200).json({ message: "Video deleted" });
};
