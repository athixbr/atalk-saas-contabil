import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmInteraction from "../../models/CrmInteraction";

interface Request {
  id: string;
  companyId: number;
  type?: string;
  description?: string;
  date?: Date | string;
  metadata?: object;
}

const UpdateService = async (data: Request): Promise<CrmInteraction> => {
  const { id, companyId } = data;

  const interaction = await CrmInteraction.findOne({
    where: { id, companyId }
  });

  if (!interaction) {
    throw new AppError("ERR_NO_CRM_INTERACTION_FOUND", 404);
  }

  await interaction.update(data);

  await interaction.reload({
    include: [
      { association: "user" },
      { association: "lead" }
    ]
  });

  return interaction;
};

export default UpdateService;
