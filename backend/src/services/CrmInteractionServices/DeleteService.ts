import CrmInteraction from "../../models/CrmInteraction";
import AppError from "../../errors/AppError";

const DeleteService = async (id: string, companyId: number): Promise<void> => {
  const interaction = await CrmInteraction.findOne({
    where: { id, companyId }
  });

  if (!interaction) {
    throw new AppError("ERR_NO_CRM_INTERACTION_FOUND", 404);
  }

  await interaction.destroy();
};

export default DeleteService;
