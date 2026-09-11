import { Request, Response } from "express";
import ListEmailTemplatesService from "../services/EmailTemplateServices/ListEmailTemplatesService";
import CreateEmailTemplateService from "../services/EmailTemplateServices/CreateEmailTemplateService";
import UpdateEmailTemplateService from "../services/EmailTemplateServices/UpdateEmailTemplateService";
import DeleteEmailTemplateService from "../services/EmailTemplateServices/DeleteEmailTemplateService";
import ListEmailTemplateVariablesService from "../services/EmailTemplateServices/ListEmailTemplateVariablesService";
import SendEmailService, { replaceVariables } from "../services/SendEmailService";
import EmailConfig from "../models/EmailConfig";
import EmailTemplate from "../models/EmailTemplate";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const templates = await ListEmailTemplatesService(companyId);
  return res.json(templates);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { title, subject, body, design } = req.body;

  const template = await CreateEmailTemplateService({ companyId, title, subject, body, design });
  return res.status(201).json(template);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { title, subject, body, design } = req.body;

  const template = await UpdateEmailTemplateService({
    id: parseInt(id),
    companyId,
    title,
    subject,
    body,
    design,
  });

  return res.json(template);
};

export const listVariables = async (_req: Request, res: Response): Promise<Response> => {
  const variables = ListEmailTemplateVariablesService();
  return res.json(variables);
};

export const uploadImage = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const files = req.files as Express.Multer.File[];
  const file = files && files[0];

  if (!file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado." });
  }

  const url = `${process.env.BACKEND_URL}${
    process.env.PROXY_PORT ? `:${process.env.PROXY_PORT}` : ""
  }/public/company${companyId}/email-templates/${file.filename}`;

  return res.json({ data: [{ src: url }] });
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteEmailTemplateService(parseInt(id), companyId);
  return res.status(200).json({ message: "Template removido." });
};

export const sendTest = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { to, configId } = req.body;

  const template = await EmailTemplate.findOne({ where: { id: parseInt(id), companyId } });

  if (!template) {
    return res.status(404).json({ error: "Template não encontrado." });
  }

  const activeConfig = configId
    ? await EmailConfig.findOne({ where: { id: configId, companyId } })
    : await EmailConfig.findOne({ where: { companyId, active: true } });

  if (!activeConfig) {
    return res.status(400).json({ error: "Nenhuma configuração de e-mail ativa encontrada." });
  }

  const mockVariables = ListEmailTemplateVariablesService().reduce(
    (acc, { variables }) => {
      variables.forEach(({ key, sample }) => {
        acc[key] = sample;
      });
      return acc;
    },
    {} as Record<string, string>
  );

  await SendEmailService({
    companyId,
    configId: activeConfig.id,
    to,
    subject: replaceVariables(template.subject, mockVariables),
    html: replaceVariables(template.body, mockVariables),
    templateId: template.id,
  });

  return res.json({ message: "E-mail de teste enviado com sucesso." });
};
