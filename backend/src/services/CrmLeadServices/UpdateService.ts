import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmLead from "../../models/CrmLead";

interface Request {
  id: string;
  companyId: number;
  name?: string;
  contactId?: number | string;
  phone?: string;
  email?: string;
  businessTypeId?: number | string;
  taxRegimeId?: number | string;
  sourceId?: number | string;
  userId?: number | string;
  stage?: string;
  estimatedValue?: number;
  lastContactDate?: Date | string;
  nextAction?: string;
  nextActionDate?: Date | string;
  lostReason?: string;
  closedAt?: Date | string;
  status?: string;
  notes?: string;
}

const UpdateService = async (data: Request): Promise<CrmLead> => {
  const { id, companyId } = data;

  const lead = await CrmLead.findOne({
    where: { id, companyId }
  });

  if (!lead) {
    throw new AppError("ERR_NO_CRM_LEAD_FOUND", 404);
  }

  await lead.update(data);

  await lead.reload({
    include: [
      { association: "contact" },
      { association: "user" },
      { association: "businessType" },
      { association: "taxRegime" },
      { association: "source" }
    ]
  });

  return lead;
};

export default UpdateService;
