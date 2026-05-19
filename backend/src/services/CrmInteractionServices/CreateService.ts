import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmInteraction from "../../models/CrmInteraction";

interface Request {
  leadId: number | string;
  userId: number | string;
  type: string;
  description: string;
  date?: Date | string;
  metadata?: object;
  companyId: number | string;
}

const CreateService = async (data: Request): Promise<CrmInteraction> => {
  const schema = Yup.object().shape({
    leadId: Yup.number().required(),
    userId: Yup.number().required(),
    type: Yup.string().required(),
    description: Yup.string().required().min(2)
  });

  try {
    await schema.validate({ 
      leadId: data.leadId,
      userId: data.userId,
      type: data.type,
      description: data.description
    });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const interaction = await CrmInteraction.create({
    ...data,
    date: data.date || new Date()
  });

  await interaction.reload({
    include: [
      { association: "user" },
      { association: "lead" }
    ]
  });

  return interaction;
};

export default CreateService;
