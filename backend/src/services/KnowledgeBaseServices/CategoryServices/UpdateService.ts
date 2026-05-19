import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import KnowledgeBaseCategory from "../../../models/KnowledgeBaseCategory";
import AppError from "../../../errors/AppError";

interface CategoryData {
  name?: string;
  description?: string;
  parentId?: number;
  icon?: string;
  color?: string;
  order?: number;
  isActive?: boolean;
}

interface Request {
  categoryData: CategoryData;
  id: string | number;
  companyId: number;
}

const UpdateService = async ({
  categoryData,
  id,
  companyId
}: Request): Promise<KnowledgeBaseCategory> => {
  const category = await KnowledgeBaseCategory.findByPk(id);

  if (!category) {
    throw new AppError("ERR_CATEGORY_NOT_FOUND", 404);
  }

  // Se mudou o nome, atualizar slug
  if (categoryData.name && categoryData.name !== category.name) {
    const slug = categoryData.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    // Verificar se já existe outra categoria com esse slug
    const existingCategory = await KnowledgeBaseCategory.findOne({
      where: { slug, id: { [Op.ne]: id } }
    });

    if (existingCategory) {
      throw new AppError("ERR_CATEGORY_SLUG_ALREADY_EXISTS", 400);
    }

    await category.update({ ...categoryData, slug });
  } else {
    await category.update(categoryData);
  }

  await category.reload({
    include: [
      {
        model: KnowledgeBaseCategory,
        as: "children"
      }
    ]
  });

  return category;
};

export default UpdateService;
