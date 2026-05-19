import CampaignGrupo from "../../models/CampaignGrupo";
import CampaignGrupoGroup from "../../models/CampaignGrupoGroup";
import AppError from "../../errors/AppError";

interface Request {
  id: string | number;
  companyId: number;
}

const RestartCampaignGrupoService = async ({
  id,
  companyId
}: Request): Promise<CampaignGrupo> => {
  const campaign = await CampaignGrupo.findOne({
    where: {
      id,
      companyId
    }
  });

  if (!campaign) {
    throw new AppError("Campanha não encontrada", 404);
  }

  if (campaign.status !== "canceled") {
    throw new AppError("Apenas campanhas canceladas podem ser reiniciadas");
  }

  // Resetar status da campanha
  campaign.status = "pending";
  campaign.sentCount = 0;
  campaign.failedCount = 0;
  campaign.startedAt = null;
  campaign.finishedAt = null;
  await campaign.save();

  // Resetar status dos grupos para pending
  await CampaignGrupoGroup.update(
    {
      status: "pending",
      sentAt: null,
      messageId: null,
      errorMessage: null
    },
    {
      where: {
        campaignGrupoId: campaign.id
      }
    }
  );

  return campaign;
};

export default RestartCampaignGrupoService;
