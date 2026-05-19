import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import isAuth from "../middleware/isAuth";

import * as KnowledgeBaseArticleController from "../controllers/KnowledgeBaseArticleController";
import * as KnowledgeBaseAttachmentController from "../controllers/KnowledgeBaseAttachmentController";
import * as KnowledgeBaseVideoController from "../controllers/KnowledgeBaseVideoController";

const knowledgeBaseArticleRoutes = express.Router();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const articleId = req.params.articleId;
    const uploadDir = path.join(
      __dirname,
      "..",
      "..",
      "public",
      "knowledge-base",
      "articles",
      articleId
    );

    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/ogg",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  }
});

// Rotas de artigos
knowledgeBaseArticleRoutes.get("/knowledge-base/articles", isAuth, KnowledgeBaseArticleController.index);

knowledgeBaseArticleRoutes.get("/knowledge-base/articles/search", isAuth, KnowledgeBaseArticleController.search);

knowledgeBaseArticleRoutes.get("/knowledge-base/articles/featured", isAuth, KnowledgeBaseArticleController.featured);

knowledgeBaseArticleRoutes.post("/knowledge-base/articles", isAuth, KnowledgeBaseArticleController.store);

knowledgeBaseArticleRoutes.get("/knowledge-base/articles/:articleId", isAuth, KnowledgeBaseArticleController.show);

knowledgeBaseArticleRoutes.put("/knowledge-base/articles/:articleId", isAuth, KnowledgeBaseArticleController.update);

knowledgeBaseArticleRoutes.delete("/knowledge-base/articles/:articleId", isAuth, KnowledgeBaseArticleController.remove);

knowledgeBaseArticleRoutes.post("/knowledge-base/articles/:articleId/view", isAuth, KnowledgeBaseArticleController.incrementView);

// Rotas de anexos
knowledgeBaseArticleRoutes.get("/knowledge-base/articles/:articleId/attachments", isAuth, KnowledgeBaseAttachmentController.index);

knowledgeBaseArticleRoutes.post(
  "/knowledge-base/articles/:articleId/attachments",
  isAuth,
  upload.single("file"),
  KnowledgeBaseAttachmentController.store
);

knowledgeBaseArticleRoutes.delete("/knowledge-base/attachments/:attachmentId", isAuth, KnowledgeBaseAttachmentController.remove);

// Rotas de vídeos
knowledgeBaseArticleRoutes.get("/knowledge-base/articles/:articleId/videos", isAuth, KnowledgeBaseVideoController.index);

knowledgeBaseArticleRoutes.post("/knowledge-base/articles/:articleId/videos", isAuth, KnowledgeBaseVideoController.store);

knowledgeBaseArticleRoutes.delete("/knowledge-base/videos/:videoId", isAuth, KnowledgeBaseVideoController.remove);

export default knowledgeBaseArticleRoutes;
