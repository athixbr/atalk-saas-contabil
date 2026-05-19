import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import KnowledgeBaseArticle from "../../../models/KnowledgeBaseArticle";
import KnowledgeBaseTag from "../../../models/KnowledgeBaseTag";
import KnowledgeBaseVideo from "../../../models/KnowledgeBaseVideo";
import KnowledgeBaseCategory from "../../../models/KnowledgeBaseCategory";
import User from "../../../models/User";
import AppError from "../../../errors/AppError";

interface ArticleData {
  title?: string;
  content?: string;
  summary?: string;
  categoryId?: number;
  status?: string;
  featured?: boolean;
  tags?: string[];
  videos?: any[];
}

interface Request {
  articleData: ArticleData;
  id: string | number;
  companyId: number;
}

const UpdateService = async ({
  articleData,
  id,
  companyId
}: Request): Promise<KnowledgeBaseArticle> => {
  const article = await KnowledgeBaseArticle.findOne({
    where: { id, companyId }
  });

  if (!article) {
    throw new AppError("ERR_ARTICLE_NOT_FOUND", 404);
  }

  const updateData: any = { ...articleData };
  
  // Converter categoryId vazio para null
  if ('categoryId' in updateData) {
    updateData.categoryId = updateData.categoryId || null;
  }

  // Se mudou o título, atualizar slug
  if (articleData.title && articleData.title !== article.title) {
    const slug = articleData.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    // Verificar se já existe outro artigo com esse slug
    const existingArticle = await KnowledgeBaseArticle.findOne({
      where: { 
        slug, 
        companyId,
        id: { [Op.ne]: id } 
      }
    });

    if (existingArticle) {
      throw new AppError("ERR_ARTICLE_SLUG_ALREADY_EXISTS", 400);
    }

    updateData.slug = slug;
  }

  // Se mudou para published e não tinha publishedAt, definir agora
  if (articleData.status === "published" && !article.publishedAt) {
    updateData.publishedAt = new Date();
  }

  await article.update(updateData);

  // Atualizar tags se fornecidas
  if (articleData.tags) {
    await article.$set("tags", []);

    for (const tagName of articleData.tags) {
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

  // Atualizar vídeos se fornecidos
  if (articleData.videos) {
    await KnowledgeBaseVideo.destroy({ where: { articleId: id } });

    for (const videoData of articleData.videos) {
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

export default UpdateService;
