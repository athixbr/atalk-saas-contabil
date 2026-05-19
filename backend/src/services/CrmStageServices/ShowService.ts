import CrmStage from "../../models/CrmStage";
import AppError from "../../errors/AppError";

const ShowService = async (id: string, companyId: number): Promise<CrmStage> => {
  const stage = await CrmStage.findOne({
    where: { id, companyId }
  });

  if (!stage) {
    throw new AppError("ERR_NO_CRM_STAGE_FOUND", 404);
  }

  return stage;
};

export default ShowService;
