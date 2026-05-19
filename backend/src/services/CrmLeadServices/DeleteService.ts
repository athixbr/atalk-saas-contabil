import CrmLead from "../../models/CrmLead";
import AppError from "../../errors/AppError";

const DeleteService = async (id: string, companyId: number): Promise<void> => {
  const lead = await CrmLead.findOne({
    where: { id, companyId }
  });

  if (!lead) {
    throw new AppError("ERR_NO_CRM_LEAD_FOUND", 404);
  }

  await lead.destroy();
};

export default DeleteService;
