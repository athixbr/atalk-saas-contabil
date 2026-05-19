import CampaignGrupo from "../../models/CampaignGrupo";
import CampaignGrupoGroup from "../../models/CampaignGrupoGroup";
import CampaignGrupoConfig from "../../models/CampaignGrupoConfig";
import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import fs from "fs";
import path from "path";
import { getMessageOptions } from "../WbotServices/SendWhatsAppMedia";

interface Request {
  campaignId: number;
  companyId: number;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const ProcessCampaignService = async ({
  campaignId,
  companyId
}: Request): Promise<void> => {
  console.log(`[CAMPAIGN-GRUPO] Iniciando processamento da campanha ${campaignId}`);
  
  try {
    // Buscar campanha
    const campaign = await CampaignGrupo.findOne({
      where: {
        id: campaignId,
        companyId,
        status: "pending"
      },
      include: [
        {
          model: CampaignGrupoGroup,
          as: "groups",
          where: { status: "pending" }
        }
      ]
    });

    if (!campaign) {
      console.error(`[CAMPAIGN-GRUPO] Campanha ${campaignId} não encontrada ou não está pendente`);
      throw new AppError("Campanha não encontrada ou não está pendente", 404);
    }

    if (!campaign.groups || campaign.groups.length === 0) {
      console.error(`[CAMPAIGN-GRUPO] Campanha ${campaignId} não tem grupos pendentes`);
      throw new AppError("Nenhum grupo pendente para envio", 400);
    }

    console.log(`[CAMPAIGN-GRUPO] Campanha ${campaignId}: ${campaign.groups.length} grupos para processar`);

    // Buscar configurações
    let config = await CampaignGrupoConfig.findOne({
      where: { companyId }
    });

    if (!config) {
      config = await CampaignGrupoConfig.create({
        companyId,
        syncInterval: 60,
        autoSync: true,
        maxGroupsPerCampaign: 50,
        delayBetweenMessages: 5
      });
    }

    const delaySeconds = config.delayBetweenMessages * 1000;

    // Atualizar status para processing
    campaign.status = "processing";
    campaign.startedAt = new Date();
    await campaign.save();

    console.log(`[CAMPAIGN-GRUPO] Campanha ${campaignId} marcada como processing`);

    // Obter bot do WhatsApp
    let wbot;
    try {
      wbot = getWbot(campaign.whatsappId);
      console.log(`[CAMPAIGN-GRUPO] WhatsApp ${campaign.whatsappId} conectado`);
    } catch (error) {
      console.error(`[CAMPAIGN-GRUPO] Erro ao obter WhatsApp ${campaign.whatsappId}:`, error);
      campaign.status = "finished";
      campaign.failedCount = campaign.groups.length;
      campaign.finishedAt = new Date();
      await campaign.save();
      
      // Marcar todos os grupos como failed
      for (const group of campaign.groups) {
        group.status = "failed";
        group.errorMessage = "WhatsApp não está conectado";
        await group.save();
      }
      
      throw new AppError(`WhatsApp não conectado: ${error.message}`, 400);
    }

  let sentCount = 0;
  let failedCount = 0;

  // Processar cada grupo
  for (const group of campaign.groups) {
    try {
      // Montar destinatário
      const groupJid = group.groupId.includes("@") ? group.groupId : `${group.groupId}@g.us`;

      // Preparar mensagem
      let optionsMsg: any = {};

      if (campaign.mediaPath) {
        const mediaPath = path.resolve("public", campaign.mediaPath);
        if (fs.existsSync(mediaPath)) {
          optionsMsg = await getMessageOptions(
            campaign.mediaPath,
            mediaPath,
            String(companyId),
            campaign.message
          );
        } else {
          // Se não encontrou arquivo, envia só texto
          optionsMsg = {
            text: campaign.message
          };
        }
      } else {
        optionsMsg = {
          text: campaign.message
        };
      }

      // Enviar mensagem
      const sentMessage = await wbot.sendMessage(groupJid, optionsMsg);

      // Atualizar status do grupo
      group.status = "sent";
      group.sentAt = new Date();
      group.messageId = sentMessage.key.id || null;
      await group.save();
      sentCount++;

      // Aguardar delay entre mensagens
      if (campaign.groups.indexOf(group) < campaign.groups.length - 1) {
        await sleep(delaySeconds);
      }

    } catch (error) {
      console.error(`Erro ao enviar para grupo ${group.groupName}:`, error);
      group.status = "failed";
      group.errorMessage = error.message || "Erro desconhecido";
      await group.save();
      failedCount++;
    }
  }

  // Atualizar campanha
  campaign.sentCount = sentCount;
  campaign.failedCount = failedCount;
  campaign.status = "finished";
  campaign.finishedAt = new Date();
  await campaign.save();

  console.log(`[CAMPAIGN-GRUPO] Campanha ${campaignId} finalizada. Enviadas: ${sentCount}, Falhas: ${failedCount}`);
  
  } catch (error) {
    console.error(`[CAMPAIGN-GRUPO] Erro geral ao processar campanha ${campaignId}:`, error);
    throw error;
  }
};

export default ProcessCampaignService;
