import EmailConfig from "../../models/EmailConfig";

const ListEmailConfigsService = async (companyId: number): Promise<EmailConfig[]> => {
  return EmailConfig.findAll({
    where: { companyId },
    order: [["createdAt", "DESC"]],
  });
};

export default ListEmailConfigsService;
