import WhatsappTemplate from "../../models/WhatsappTemplate";

interface Request {
  companyId: number;
}

const ListWhatsappTemplatesService = async ({ companyId }: Request) => {
  const whatsappTemplates = await WhatsappTemplate.findAll({
    where: { companyId },
    order: [["title", "ASC"]]
  });
  return whatsappTemplates;
};

export default ListWhatsappTemplatesService;
