import KnowledgeBaseCategory from "../../../models/KnowledgeBaseCategory";
import AppError from "../../../errors/AppError";

interface Request {
  id: string | number;
  companyId: number;
}

const ShowService = async ({ id, companyId }: Request): Promise<KnowledgeBaseCategory> => {
  const category = await KnowledgeBaseCategory.findOne({
    where: { id },
    include: [
      {
        model: KnowledgeBaseCategory,
        as: "children",
        required: false
      },
      {
        model: KnowledgeBaseCategory,
        as: "parent",
        required: false
      }
    ]
  });

  if (!category) {
    throw new AppError("ERR_CATEGORY_NOT_FOUND", 404);
  }

  return category;
};

export default ShowService;
