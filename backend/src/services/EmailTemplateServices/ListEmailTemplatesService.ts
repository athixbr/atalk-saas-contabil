import EmailTemplate from "../../models/EmailTemplate";

const ListEmailTemplatesService = async (companyId: number): Promise<EmailTemplate[]> => {
  return EmailTemplate.findAll({
    where: { companyId },
    order: [["createdAt", "DESC"]],
  });
};

export default ListEmailTemplatesService;
