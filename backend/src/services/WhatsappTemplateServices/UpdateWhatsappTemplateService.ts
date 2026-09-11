import WhatsappTemplate from "../../models/WhatsappTemplate";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
  title?: string;
  body?: string;
}

const UpdateWhatsappTemplateService = async ({ id, companyId, title, body }: Request) => {
  const template = await WhatsappTemplate.findOne({ where: { id, companyId } });
  if (!template) throw new AppError("ERR_WHATSAPP_TEMPLATE_NOT_FOUND", 404);

  await template.update({ title, body });
  return template;
};

export default UpdateWhatsappTemplateService;
