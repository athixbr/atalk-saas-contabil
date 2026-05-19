import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmTaskStage from "../../models/CrmTaskStage";

interface Request {
  companyId: number | string;
  name: string;
  color?: string;
  order?: number;
}

const CreateService = async (data: Request): Promise<CrmTaskStage> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(2),
    companyId: Yup.number().required()
  });

  try {
    await schema.validate({
      name: data.name,
      companyId: data.companyId
    });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const stage = await CrmTaskStage.create({
    ...data,
    color: data.color || "#1976d2",
    order: data.order || 0
  });

  return stage;
};

export default CreateService;
