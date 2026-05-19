import KnowledgeBaseCategory from "../../../models/KnowledgeBaseCategory";
import AppError from "../../../errors/AppError";

interface Request {
  name: string;
  description?: string;
  parentId?: number;
  icon?: string;
  color?: string;
  order?: number;
  companyId: number;
}

const CreateService = async ({
  name,
  description,
  parentId,
  icon,
  color,
  order = 0,
  companyId
}: Request): Promise<KnowledgeBaseCategory> => {
  
  // Gerar slug a partir do nome
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

  // Verificar se já existe categoria com esse slug
  const existingCategory = await KnowledgeBaseCategory.findOne({
    where: { slug }
  });

  if (existingCategory) {
    throw new AppError("ERR_CATEGORY_SLUG_ALREADY_EXISTS", 400);
  }

  const category = await KnowledgeBaseCategory.create({
    name,
    slug,
    description,
    parentId,
    icon,
    color,
    order,
    isActive: true
  });

  return category;
};

export default CreateService;
