import CrmInteraction from "../../models/CrmInteraction";
import User from "../../models/User";
import CrmLead from "../../models/CrmLead";
import AppError from "../../errors/AppError";

const ShowService = async (id: string, companyId: number): Promise<CrmInteraction> => {
  const interaction = await CrmInteraction.findOne({
    where: { id, companyId },
    include: [
      { model: User, as: "user", attributes: ["id", "name", "email"] },
      { model: CrmLead, as: "lead" }
    ]
  });

  if (!interaction) {
    throw new AppError("ERR_NO_CRM_INTERACTION_FOUND", 404);
  }

  return interaction;
};

export default ShowService;
