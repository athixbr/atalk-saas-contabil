import CrmTaskCategory from "../../models/CrmTaskCategory";
import AppError from "../../errors/AppError";

const DeleteService = async (id: string, companyId: number): Promise<void> => {
  const category = await CrmTaskCategory.findOne({
    where: { id, companyId }
  });

  if (!category) {
    throw new AppError("ERR_NO_CRM_TASK_CATEGORY_FOUND", 404);
  }

  await category.destroy();
};

export default DeleteService;
