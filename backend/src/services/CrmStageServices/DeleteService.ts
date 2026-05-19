import CrmStage from "../../models/CrmStage";
import AppError from "../../errors/AppError";

const DeleteService = async (id: string, companyId: number): Promise<void> => {
  const stage = await CrmStage.findOne({
    where: { id, companyId }
  });

  if (!stage) {
    throw new AppError("ERR_NO_CRM_STAGE_FOUND", 404);
  }

  await stage.destroy();
};

export default DeleteService;
