import KnowledgeBaseArticle from "../../../models/KnowledgeBaseArticle";
import KnowledgeBaseAttachment from "../../../models/KnowledgeBaseAttachment";
import AppError from "../../../errors/AppError";
import fs from "fs";
import path from "path";

interface Request {
  id: string | number;
  companyId: number;
}

const DeleteService = async ({ id, companyId }: Request): Promise<void> => {
  const article = await KnowledgeBaseArticle.findOne({
    where: { id, companyId },
    include: [{ model: KnowledgeBaseAttachment, as: "attachments" }]
  });

  if (!article) {
    throw new AppError("ERR_ARTICLE_NOT_FOUND", 404);
  }

  // Deletar arquivos físicos dos anexos
  if (article.attachments && article.attachments.length > 0) {
    for (const attachment of article.attachments) {
      const fullPath = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "public",
        attachment.filePath
      );

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  }

  // Deletar diretório do artigo se existir
  const articleDir = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "public",
    "knowledge-base",
    "articles",
    String(id)
  );

  if (fs.existsSync(articleDir)) {
    fs.rmSync(articleDir, { recursive: true, force: true });
  }

  await article.destroy();
};

export default DeleteService;
