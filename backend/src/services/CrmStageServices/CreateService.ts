import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmStage from "../../models/CrmStage";

interface Request {
  name: string;
  order: number;
  color?: string;
  companyId: number | string;
  active?: boolean;
}

const CreateService = async ({
  name,
  order,
  color,
  companyId,
  active = true
}: Request): Promise<CrmStage> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(2),
    order: Yup.number().required()
  });

  try {
    await schema.validate({ name, order });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const stage = await CrmStage.create({
    name,
    order,
    color,
    companyId,
    active
  });

  return stage;
};

export default CreateService;
