import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmBusinessType from "../../models/CrmBusinessType";

interface Request {
  name: string;
  description?: string;
  companyId: number | string;
  active?: boolean;
}

const CreateService = async ({
  name,
  description,
  companyId,
  active = true
}: Request): Promise<CrmBusinessType> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(2)
  });

  try {
    await schema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const businessType = await CrmBusinessType.create({
    name,
    description,
    companyId,
    active
  });

  return businessType;
};

export default CreateService;
