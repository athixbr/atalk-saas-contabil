import CampaignGrupo from "../../models/CampaignGrupo";
import CampaignGrupoGroup from "../../models/CampaignGrupoGroup";
import AppError from "../../errors/AppError";

interface Request {
  id: string | number;
  companyId: number;
}

const DeleteCampaignGrupoService = async ({
  id,
  companyId
}: Request): Promise<void> => {
  const campaign = await CampaignGrupo.findOne({
    where: {
      id,
      companyId
    }
  });

  if (!campaign) {
    throw new AppError("Campanha não encontrada", 404);
  }

  // Só permitir deletar campanhas finalizadas ou canceladas
  if (campaign.status !== "finished" && campaign.status !== "canceled") {
    throw new AppError(
      "Apenas campanhas finalizadas ou canceladas podem ser deletadas"
    );
  }

  // Deletar grupos associados
  await CampaignGrupoGroup.destroy({
    where: {
      campaignGrupoId: campaign.id
    }
  });

  // Deletar campanha
  await campaign.destroy();
};

export default DeleteCampaignGrupoService;
