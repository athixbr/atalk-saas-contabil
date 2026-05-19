import KnowledgeBaseCategory from "../../../models/KnowledgeBaseCategory";
import KnowledgeBaseArticle from "../../../models/KnowledgeBaseArticle";
import AppError from "../../../errors/AppError";

interface Request {
  id: string | number;
  companyId: number;
}

const DeleteService = async ({ id, companyId }: Request): Promise<void> => {
  const category = await KnowledgeBaseCategory.findByPk(id);

  if (!category) {
    throw new AppError("ERR_CATEGORY_NOT_FOUND", 404);
  }

  // Verificar se há artigos nesta categoria
  const articlesCount = await KnowledgeBaseArticle.count({
    where: { categoryId: id }
  });

  if (articlesCount > 0) {
    throw new AppError("ERR_CATEGORY_HAS_ARTICLES", 400);
  }

  // Verificar se há categorias filhas
  const childrenCount = await KnowledgeBaseCategory.count({
    where: { parentId: id }
  });

  if (childrenCount > 0) {
    throw new AppError("ERR_CATEGORY_HAS_CHILDREN", 400);
  }

  await category.destroy();
};

export default DeleteService;
