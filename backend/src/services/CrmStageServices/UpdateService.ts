import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmStage from "../../models/CrmStage";

interface Request {
  id: string;
  name?: string;
  order?: number;
  color?: string;
  companyId: number;
  active?: boolean;
}

const UpdateService = async ({
  id,
  name,
  order,
  color,
  companyId,
  active
}: Request): Promise<CrmStage> => {
  const stage = await CrmStage.findOne({
    where: { id, companyId }
  });

  if (!stage) {
    throw new AppError("ERR_NO_CRM_STAGE_FOUND", 404);
  }

  if (name !== undefined) stage.name = name;
  if (order !== undefined) stage.order = order;
  if (color !== undefined) stage.color = color;
  if (active !== undefined) stage.active = active;

  await stage.save();

  return stage;
};

export default UpdateService;
