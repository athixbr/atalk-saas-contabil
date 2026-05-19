import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import KnowledgeBaseArticle from "../../../models/KnowledgeBaseArticle";
import KnowledgeBaseTag from "../../../models/KnowledgeBaseTag";
import KnowledgeBaseVideo from "../../../models/KnowledgeBaseVideo";
import KnowledgeBaseCategory from "../../../models/KnowledgeBaseCategory";
import User from "../../../models/User";
import AppError from "../../../errors/AppError";

interface VideoData {
  videoUrl: string;
  videoType?: string;
  thumbnail?: string;
  title?: string;
  order?: number;
}

interface Request {
  title: string;
  content: string;
  summary?: string;
  categoryId?: number;
  userId: number;
  companyId: number;
  status?: string;
  featured?: boolean;
  tags?: string[];
  videos?: VideoData[];
}

const CreateService = async ({
  title,
  content,
  summary,
  categoryId,
  userId,
  companyId,
  status = "draft",
  featured = false,
  tags = [],
  videos = []
}: Request): Promise<KnowledgeBaseArticle> => {
  
  // Converter categoryId vazio para null
  const validCategoryId = categoryId || null;
  
  // Gerar slug a partir do título
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

  // Verificar se já existe artigo com esse slug
  const existingArticle = await KnowledgeBaseArticle.findOne({
    where: { slug, companyId }
  });

  if (existingArticle) {
    throw new AppError("ERR_ARTICLE_SLUG_ALREADY_EXISTS", 400);
  }

  const article = await KnowledgeBaseArticle.create({
    title,
    slug,
    content,
    summary,
    categoryId: validCategoryId,
    userId,
    companyId,
    status,
    featured,
    publishedAt: status === "published" ? new Date() : null
  });

  // Adicionar tags
  if (tags && tags.length > 0) {
    for (const tagName of tags) {
      const tagSlug = tagName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

      let tag = await KnowledgeBaseTag.findOne({ where: { slug: tagSlug } });

      if (!tag) {
        tag = await KnowledgeBaseTag.create({
          name: tagName,
          slug: tagSlug
        });
      }

      await article.$add("tags", tag);
    }
  }

  // Adicionar vídeos
  if (videos && videos.length > 0) {
    for (const videoData of videos) {
      await KnowledgeBaseVideo.create({
        articleId: article.id,
        ...videoData
      });
    }
  }

  await article.reload({
    include: [
      { model: KnowledgeBaseCategory, as: "category" },
      { model: User, as: "user", attributes: ["id", "name", "email"] },
      { model: KnowledgeBaseTag, as: "tags" },
      { model: KnowledgeBaseVideo, as: "videos" }
    ]
  });

  return article;
};

export default CreateService;
