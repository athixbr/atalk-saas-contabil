import { Request, Response } from "express";
import AppError from "../errors/AppError";
import ListStoriesService from "../services/WhatsappStoryServices/ListStoriesService";
import MarkStorySeenService from "../services/WhatsappStoryServices/MarkStorySeenService";
import PublishStoryService from "../services/WhatsappStoryServices/PublishStoryService";
import DeleteStoryService from "../services/WhatsappStoryServices/DeleteStoryService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, profile } = req.user;

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { whatsappId, direction, onlyActive } = req.query as {
    whatsappId?: string;
    direction?: "received" | "sent" | "all";
    onlyActive?: string;
  };

  const groups = await ListStoriesService({
    companyId,
    whatsappId: whatsappId ? Number(whatsappId) : undefined,
    direction: direction || "received",
    onlyActive: onlyActive !== "false"
  });

  return res.json(groups);
};

export const markSeen = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, profile } = req.user;

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { storyId } = req.params;

  const story = await MarkStorySeenService(Number(storyId), companyId);

  return res.json(story);
};

export const publish = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, profile } = req.user;

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { whatsappId, mediaType, textContent, backgroundColor, caption, statusJidList } = req.body;

  if (!whatsappId || !mediaType) {
    throw new AppError("whatsappId e mediaType são obrigatórios", 400);
  }

  // Arquivo de mídia enviado via multipart/form-data
  let mediaBuffer: Buffer | undefined;
  let mediaFileName: string | undefined;
  let mediaMimeType: string | undefined;

  if (req.file) {
    mediaBuffer = req.file.buffer;
    mediaFileName = req.file.originalname;
    mediaMimeType = req.file.mimetype;
  }

  const story = await PublishStoryService({
    companyId,
    whatsappId: Number(whatsappId),
    mediaType: mediaType as "text" | "image" | "video",
    textContent,
    backgroundColor,
    caption,
    mediaBuffer,
    mediaFileName,
    mediaMimeType,
    statusJidList: statusJidList
      ? (Array.isArray(statusJidList) ? statusJidList : JSON.parse(statusJidList))
      : []
  });

  return res.status(201).json(story);
};

export const destroy = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, profile } = req.user;

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { storyId } = req.params;

  await DeleteStoryService(Number(storyId), companyId);

  return res.status(200).json({ message: "Story excluído com sucesso" });
};
