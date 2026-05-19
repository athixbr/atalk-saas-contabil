import AppError from "../../errors/AppError";
import CrmTaskStage from "../../models/CrmTaskStage";

interface Request {
  stageId: number | string;
}

const DeleteService = async ({ stageId }: Request): Promise<void> => {
  const stage = await CrmTaskStage.findByPk(stageId);

  if (!stage) {
    throw new AppError("Etapa não encontrada", 404);
  }

  await stage.destroy();
};

export default DeleteService;
