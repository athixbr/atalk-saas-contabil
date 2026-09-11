import EmailTemplate from "../../models/EmailTemplate";

interface Request {
  companyId: number;
  title: string;
  subject: string;
  body: string;
  design?: object;
}

const CreateEmailTemplateService = async (data: Request): Promise<EmailTemplate> => {
  return EmailTemplate.create(data as any);
};

export default CreateEmailTemplateService;
