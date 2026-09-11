import { Request, Response } from "express";
import ListWhatsappTemplatesService from "../services/WhatsappTemplateServices/ListWhatsappTemplatesService";
import CreateWhatsappTemplateService from "../services/WhatsappTemplateServices/CreateWhatsappTemplateService";
import UpdateWhatsappTemplateService from "../services/WhatsappTemplateServices/UpdateWhatsappTemplateService";
import DeleteWhatsappTemplateService from "../services/WhatsappTemplateServices/DeleteWhatsappTemplateService";

export const index = async (req: Request, res: Response) => {
  const { companyId } = req.user;
  const templates = await ListWhatsappTemplatesService({ companyId });
  return res.json({ whatsappTemplates: templates });
};

export const store = async (req: Request, res: Response) => {
  const { companyId } = req.user;
  const { title, body } = req.body;
  const template = await CreateWhatsappTemplateService({ companyId, title, body });
  return res.status(201).json(template);
};

export const update = async (req: Request, res: Response) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { title, body } = req.body;
  const template = await UpdateWhatsappTemplateService({ id: Number(id), companyId, title, body });
  return res.json(template);
};

export const remove = async (req: Request, res: Response) => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteWhatsappTemplateService({ id: Number(id), companyId });
  return res.status(200).json({ message: "Template excluído" });
};
