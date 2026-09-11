import nodemailer from "nodemailer";
import axios from "axios";
import AppError from "../errors/AppError";
import EmailConfig from "../models/EmailConfig";
import EmailLog from "../models/EmailLog";

interface SendEmailRequest {
  companyId: number;
  configId: number;
  to: string;
  subject: string;
  html: string;
  templateId?: number;
}

const replaceVariables = (text: string, variables: Record<string, string>): string => {
  return Object.entries(variables).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value || "");
  }, text);
};

const sendViaResend = async (config: EmailConfig, to: string, subject: string, html: string): Promise<void> => {
  if (!config.apiKey) throw new AppError("ERR_RESEND_API_KEY_MISSING");

  const response = await axios.post(
    "https://api.resend.com/emails",
    {
      from: config.fromName ? `${config.fromName} <${config.fromEmail}>` : config.fromEmail,
      to: [to],
      subject,
      html,
    },
    {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(`Resend API error: ${JSON.stringify(response.data)}`);
  }
};

const sendViaSmtp = async (config: EmailConfig, to: string, subject: string, html: string): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort || 587,
    secure: config.smtpSecure || false,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
  } as any);

  await transporter.sendMail({
    from: config.fromName ? `"${config.fromName}" <${config.fromEmail}>` : config.fromEmail,
    to,
    subject,
    html,
  });
};

const getGmailTransport = (config: EmailConfig) => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
  } as any);
};

const getHotmailTransport = (config: EmailConfig) => {
  return nodemailer.createTransport({
    host: "smtp.live.com",
    port: 587,
    secure: false,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
  } as any);
};

const getExchangeTransport = (config: EmailConfig) => {
  return nodemailer.createTransport({
    host: config.smtpHost || "smtp.office365.com",
    port: config.smtpPort || 587,
    secure: config.smtpSecure || false,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
  } as any);
};

const SendEmailService = async ({
  companyId,
  configId,
  to,
  subject,
  html,
  templateId,
}: SendEmailRequest): Promise<void> => {
  const config = await EmailConfig.findOne({ where: { id: configId, companyId } });

  if (!config) throw new AppError("ERR_EMAIL_CONFIG_NOT_FOUND", 404);

  let errorMessage: string | null = null;
  let status: "sent" | "failed" = "sent";

  try {
    switch (config.provider) {
      case "resend":
        await sendViaResend(config, to, subject, html);
        break;

      case "gmail": {
        const transport = getGmailTransport(config);
        await transport.sendMail({
          from: config.fromName ? `"${config.fromName}" <${config.fromEmail}>` : config.fromEmail,
          to,
          subject,
          html,
        });
        break;
      }

      case "hotmail": {
        const transport = getHotmailTransport(config);
        await transport.sendMail({
          from: config.fromName ? `"${config.fromName}" <${config.fromEmail}>` : config.fromEmail,
          to,
          subject,
          html,
        });
        break;
      }

      case "exchange": {
        const transport = getExchangeTransport(config);
        await transport.sendMail({
          from: config.fromName ? `"${config.fromName}" <${config.fromEmail}>` : config.fromEmail,
          to,
          subject,
          html,
        });
        break;
      }

      case "smtp":
      default:
        await sendViaSmtp(config, to, subject, html);
        break;
    }
  } catch (err: any) {
    status = "failed";
    errorMessage = err?.message || "Erro desconhecido";
    throw err;
  } finally {
    await EmailLog.create({
      companyId,
      emailConfigId: configId,
      emailTemplateId: templateId || null,
      toEmail: to,
      subject,
      provider: config.provider,
      status,
      errorMessage,
    } as any);
  }
};

export { replaceVariables };
export default SendEmailService;
