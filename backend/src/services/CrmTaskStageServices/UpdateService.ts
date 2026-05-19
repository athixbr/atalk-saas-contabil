import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmTaskStage from "../../models/CrmTaskStage";

interface Request {
  stageId: number | string;
  name?: string;
  color?: string;
  order?: number;
}

const UpdateService = async (data: Request): Promise<CrmTaskStage> => {
  const schema = Yup.object().shape({
    stageId: Yup.number().required()
  });

  try {
    await schema.validate({ stageId: data.stageId });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const stage = await CrmTaskStage.findByPk(data.stageId);

  if (!stage) {
    throw new AppError("Etapa não encontrada", 404);
  }

  await stage.update({
    name: data.name !== undefined ? data.name : stage.name,
    color: data.color !== undefined ? data.color : stage.color,
    order: data.order !== undefined ? data.order : stage.order
  });

  return stage;
};

export default UpdateService;
