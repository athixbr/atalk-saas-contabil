import CrmTaskCategory from "../../models/CrmTaskCategory";
import AppError from "../../errors/AppError";

const ShowService = async (id: string, companyId: number): Promise<CrmTaskCategory> => {
  const category = await CrmTaskCategory.findOne({
    where: { id, companyId }
  });

  if (!category) {
    throw new AppError("ERR_NO_CRM_TASK_CATEGORY_FOUND", 404);
  }

  return category;
};

export default ShowService;
