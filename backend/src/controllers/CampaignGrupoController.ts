import { Request, Response } from "express";
import * as Yup from "yup";
import { getIO } from "../libs/socket";
import fs from "fs";
import path from "path";
import DigitalOceanService from "../services/DigitalOceanService";

import ListService from "../services/CampaignGrupoServices/ListService";
import CreateService from "../services/CampaignGrupoServices/CreateService";
import ShowService from "../services/CampaignGrupoServices/ShowService";
import UpdateService from "../services/CampaignGrupoServices/UpdateService";
import DeleteService from "../services/CampaignGrupoServices/DeleteService";
import CancelService from "../services/CampaignGrupoServices/CancelService";
import RestartService from "../services/CampaignGrupoServices/RestartService";
import GetConfigService from "../services/CampaignGrupoServices/GetConfigService";
import UpdateConfigService from "../services/CampaignGrupoServices/UpdateConfigService";
import ProcessCampaignService from "../services/CampaignGrupoServices/ProcessCampaignService";

import AppError from "../errors/AppError";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type StoreData = {
  name: string;
  message: string;
  scheduledAt?: string;
  whatsappId: number;
  groupIds: string[];
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { records, count, hasMore } = await ListService({
    searchParam,
    pageNumber,
    companyId
  });

  return res.json({ records, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const data = req.body as StoreData;

  const schema = Yup.object().shape({
    name: Yup.string().required("Nome é obrigatório"),
    message: Yup.string().required("Mensagem é obrigatória"),
    whatsappId: Yup.number().required("Conexão é obrigatória"),
    groupIds: Yup.array().min(1, "Selecione pelo menos um grupo")
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const campaign = await CreateService({
    ...data,
    companyId
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-campaign-grupo`, {
    action: "create",
    record: campaign
  });

  // Se não tem agendamento, processar imediatamente
  if (!campaign.scheduledAt) {
    console.log(`[CONTROLLER] Iniciando processamento da campanha ${campaign.id}`);
    // Processar em background
    ProcessCampaignService({ campaignId: campaign.id, companyId })
      .then(() => {
        console.log(`[CONTROLLER] Campanha ${campaign.id} processada com sucesso`);
      })
      .catch(err => {
        console.error(`[CONTROLLER] Erro ao processar campanha ${campaign.id}:`, err);
      });
  }

  return res.status(200).json(campaign);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const campaign = await ShowService({ id, companyId });

  return res.status(200).json(campaign);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;
  const data = req.body as StoreData;

  const schema = Yup.object().shape({
    name: Yup.string(),
    message: Yup.string(),
    groupIds: Yup.array()
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const campaign = await UpdateService({
    id,
    ...data,
    companyId
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-campaign-grupo`, {
    action: "update",
    record: campaign
  });

  return res.status(200).json(campaign);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await DeleteService({ id, companyId });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-campaign-grupo`, {
    action: "delete",
    id
  });

  return res.status(200).json({ message: "Campanha deletada com sucesso" });
};

export const cancel = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const campaign = await CancelService({ id, companyId });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-campaign-grupo`, {
    action: "update",
    record: campaign
  });

  return res.status(200).json(campaign);
};

export const restart = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const campaign = await RestartService({ id, companyId });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-campaign-grupo`, {
    action: "update",
    record: campaign
  });

  return res.status(200).json(campaign);
};

export const mediaUpload = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;
  const files = req.files as Express.Multer.File[];

  const campaign = await ShowService({ id, companyId });

  if (!campaign) {
    throw new AppError("Campanha não encontrada", 404);
  }

  // Remover mídia antiga se existir
  if (campaign.mediaPath) {
    const oldPath = path.resolve("public", campaign.mediaPath);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    } else {
      try { await DigitalOceanService.delete(campaign.mediaPath); } catch (_) {}
    }
  }

  // Salvar nova mídia
  const file = files[0];
  const mediaPath = path.join("company" + companyId, "campaigns", file.filename);
  
  campaign.mediaPath = mediaPath;
  campaign.mediaName = file.originalname;
  await campaign.save();

  return res.status(200).json(campaign);
};

export const mediaDelete = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const campaign = await ShowService({ id, companyId });

  if (!campaign) {
    throw new AppError("Campanha não encontrada", 404);
  }

  if (campaign.mediaPath) {
    const filePath = path.resolve("public", campaign.mediaPath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else {
      try { await DigitalOceanService.delete(campaign.mediaPath); } catch (_) {}
    }

    campaign.mediaPath = null;
    campaign.mediaName = null;
    await campaign.save();
  }

  return res.status(200).json({ message: "Mídia removida com sucesso" });
};

export const getConfig = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const config = await GetConfigService({ companyId });

  return res.status(200).json(config);
};

export const updateConfig = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const data = req.body;

  const config = await UpdateConfigService({
    companyId,
    ...data
  });

  return res.status(200).json(config);
};

export const process = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  // Processar em background
  ProcessCampaignService({ campaignId: parseInt(id), companyId })
    .then(() => {
      const io = getIO();
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-campaign-grupo`, {
        action: "update",
        id
      });
    })
    .catch(err => console.error("Erro ao processar campanha:", err));

  return res.status(200).json({ message: "Processamento iniciado" });
};
