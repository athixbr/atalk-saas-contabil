import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmLead from "../../models/CrmLead";

interface Request {
  name: string;
  contactId?: number | string;
  phone?: string;
  email?: string;
  businessTypeId?: number | string;
  taxRegimeId?: number | string;
  sourceId?: number | string;
  userId?: number | string;
  stage?: string;
  estimatedValue?: number;
  nextAction?: string;
  nextActionDate?: Date | string;
  notes?: string;
  companyId: number | string;
}

const CreateService = async (data: Request): Promise<CrmLead> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(2)
  });

  try {
    await schema.validate({ name: data.name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const lead = await CrmLead.create({
    ...data,
    stage: data.stage || "prospecting",
    status: "active"
  });

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

export default CreateService;
