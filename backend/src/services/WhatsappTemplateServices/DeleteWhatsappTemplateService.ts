import WhatsappTemplate from "../../models/WhatsappTemplate";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteWhatsappTemplateService = async ({ id, companyId }: Request) => {
  const template = await WhatsappTemplate.findOne({ where: { id, companyId } });
  if (!template) throw new AppError("ERR_WHATSAPP_TEMPLATE_NOT_FOUND", 404);
  await template.destroy();
};

export default DeleteWhatsappTemplateService;
