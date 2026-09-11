import WhatsappTemplate from "../../models/WhatsappTemplate";

interface Request {
  companyId: number;
  title: string;
  body: string;
}

const CreateWhatsappTemplateService = async ({ companyId, title, body }: Request) => {
  const template = await WhatsappTemplate.create({ companyId, title, body });
  return template;
};

export default CreateWhatsappTemplateService;
