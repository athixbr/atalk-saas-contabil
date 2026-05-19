import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import fs from "fs";
import path from "path";

import CreateService from "../services/KnowledgeBaseServices/AttachmentServices/CreateService";
import DeleteService from "../services/KnowledgeBaseServices/AttachmentServices/DeleteService";
import ListService from "../services/KnowledgeBaseServices/AttachmentServices/ListService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { articleId } = req.params;
  const { companyId } = req.user;

  if (!req.file) {
    throw new AppError("ERR_NO_FILE_UPLOADED", 400);
  }

  const { filename, mimetype, size } = req.file;
  const filePath = path.join("knowledge-base", "articles", articleId, filename);

  let fileType: "image" | "video" | "document" = "document";
  if (mimetype.startsWith("image/")) {
    fileType = "image";
  } else if (mimetype.startsWith("video/")) {
    fileType = "video";
  }

  const attachment = await CreateService({
    articleId,
    fileName: filename,
    fileType,
    filePath,
    fileSize: size,
    mimeType: mimetype,
    companyId
  });

  const io = getIO();
  io.emit(`company${companyId}-knowledgeBaseAttachment`, {
    action: "create",
    attachment
  });

  return res.status(200).json(attachment);
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { articleId } = req.params;
  const { companyId } = req.user;

  const attachments = await ListService({ articleId, companyId });

  return res.json({ attachments });
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { attachmentId } = req.params;
  const { companyId } = req.user;

  const attachment = await DeleteService({ id: attachmentId, companyId });

  // Remove arquivo físico
  const fullPath = path.join(
    __dirname,
    "..",
    "..",
    "public",
    attachment.filePath
  );

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }

  const io = getIO();
  io.emit(`company${companyId}-knowledgeBaseAttachment`, {
    action: "delete",
    attachmentId
  });

  return res.status(200).json({ message: "Attachment deleted" });
};
