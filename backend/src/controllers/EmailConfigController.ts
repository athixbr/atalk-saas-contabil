import { Request, Response } from "express";
import ListEmailConfigsService from "../services/EmailConfigServices/ListEmailConfigsService";
import CreateEmailConfigService from "../services/EmailConfigServices/CreateEmailConfigService";
import UpdateEmailConfigService from "../services/EmailConfigServices/UpdateEmailConfigService";
import DeleteEmailConfigService from "../services/EmailConfigServices/DeleteEmailConfigService";
import SendEmailService from "../services/SendEmailService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const configs = await ListEmailConfigsService(companyId);
  return res.json(configs);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const {
    provider, name, fromName, fromEmail, apiKey,
    smtpHost, smtpPort, smtpSecure, smtpUser, smtpPassword, active,
  } = req.body;

  const config = await CreateEmailConfigService({
    companyId,
    provider,
    name,
    fromName,
    fromEmail,
    apiKey,
    smtpHost,
    smtpPort,
    smtpSecure,
    smtpUser,
    smtpPassword,
    active,
  });

  return res.status(201).json(config);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const {
    provider, name, fromName, fromEmail, apiKey,
    smtpHost, smtpPort, smtpSecure, smtpUser, smtpPassword, active,
  } = req.body;

  const config = await UpdateEmailConfigService({
    id: parseInt(id),
    companyId,
    provider,
    name,
    fromName,
    fromEmail,
    apiKey,
    smtpHost,
    smtpPort,
    smtpSecure,
    smtpUser,
    smtpPassword,
    active,
  });

  return res.json(config);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteEmailConfigService(parseInt(id), companyId);
  return res.status(200).json({ message: "Configuração removida." });
};

export const sendTest = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { to } = req.body;

  await SendEmailService({
    companyId,
    configId: parseInt(id),
    to,
    subject: "E-mail de Teste — aTalk",
    html: `<h2>Teste de envio</h2><p>Esta é uma mensagem de teste enviada pelo sistema aTalk.</p><p>Se você recebeu este e-mail, a configuração está funcionando corretamente.</p>`,
  });

  return res.json({ message: "E-mail de teste enviado com sucesso." });
};
