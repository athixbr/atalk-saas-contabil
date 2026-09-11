import AppError from "../../errors/AppError";
import EmailConfig from "../../models/EmailConfig";

interface Request {
  id: number;
  companyId: number;
  provider?: "resend" | "smtp" | "gmail" | "hotmail" | "exchange";
  name?: string;
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

const UpdateEmailConfigService = async ({ id, companyId, ...data }: Request): Promise<EmailConfig> => {
  const config = await EmailConfig.findOne({ where: { id, companyId } });

  if (!config) throw new AppError("ERR_EMAIL_CONFIG_NOT_FOUND", 404);

  await config.update(data);
  return config;
};

export default UpdateEmailConfigService;
