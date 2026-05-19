import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmTaskCategory from "../../models/CrmTaskCategory";

interface Request {
  name: string;
  type?: string;
  icon?: string;
  color?: string;
  companyId: number | string;
  active?: boolean;
}

const CreateService = async ({
  name,
  type,
  icon,
  color,
  companyId,
  active = true
}: Request): Promise<CrmTaskCategory> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(2)
  });

  try {
    await schema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const category = await CrmTaskCategory.create({
    name,
    type,
    icon,
    color,
    companyId,
    active
  });

  return category;
};

export default CreateService;
