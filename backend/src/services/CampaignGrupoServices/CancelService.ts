import CampaignGrupo from "../../models/CampaignGrupo";
import AppError from "../../errors/AppError";

interface Request {
  id: string | number;
  companyId: number;
}

const CancelCampaignGrupoService = async ({
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

  if (campaign.status !== "pending") {
    throw new AppError("Apenas campanhas pendentes podem ser canceladas");
  }

  campaign.status = "canceled";
  await campaign.save();

  return campaign;
};

export default CancelCampaignGrupoService;
