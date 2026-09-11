import EmailConfig from "../../models/EmailConfig";

interface Request {
  companyId: number;
  provider: "resend" | "smtp" | "gmail" | "hotmail" | "exchange";
  name: string;
  fromName?: string;
  fromEmail?: string;
  apiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPassword?: string;
  active?: boolean;
}

const CreateEmailConfigService = async (data: Request): Promise<EmailConfig> => {
  return EmailConfig.create(data as any);
};

export default CreateEmailConfigService;
