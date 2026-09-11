import AppError from "../../errors/AppError";
import EmailTemplate from "../../models/EmailTemplate";

interface Request {
  id: number;
  companyId: number;
  title?: string;
  subject?: string;
  body?: string;
  design?: object;
}

const UpdateEmailTemplateService = async ({ id, companyId, ...data }: Request): Promise<EmailTemplate> => {
  const template = await EmailTemplate.findOne({ where: { id, companyId } });

  if (!template) throw new AppError("ERR_EMAIL_TEMPLATE_NOT_FOUND", 404);

  await template.update(data);
  return template;
};

export default UpdateEmailTemplateService;
