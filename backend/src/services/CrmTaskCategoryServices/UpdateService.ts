import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmTaskCategory from "../../models/CrmTaskCategory";

interface Request {
  id: string;
  name?: string;
  type?: string;
  icon?: string;
  color?: string;
  companyId: number;
  active?: boolean;
}

const UpdateService = async ({
  id,
  name,
  type,
  icon,
  color,
  companyId,
  active
}: Request): Promise<CrmTaskCategory> => {
  const category = await CrmTaskCategory.findOne({
    where: { id, companyId }
  });

  if (!category) {
    throw new AppError("ERR_NO_CRM_TASK_CATEGORY_FOUND", 404);
  }

  if (name !== undefined) category.name = name;
  if (type !== undefined) category.type = type;
  if (icon !== undefined) category.icon = icon;
  if (color !== undefined) category.color = color;
  if (active !== undefined) category.active = active;

  await category.save();

  return category;
};

export default UpdateService;
