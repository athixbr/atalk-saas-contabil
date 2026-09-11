import AppError from "../../errors/AppError";
import EmailTemplate from "../../models/EmailTemplate";

const DeleteEmailTemplateService = async (id: number, companyId: number): Promise<void> => {
  const template = await EmailTemplate.findOne({ where: { id, companyId } });

  if (!template) throw new AppError("ERR_EMAIL_TEMPLATE_NOT_FOUND", 404);

  await template.destroy();
};

export default DeleteEmailTemplateService;
