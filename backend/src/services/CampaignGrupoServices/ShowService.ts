import CampaignGrupo from "../../models/CampaignGrupo";
import CampaignGrupoGroup from "../../models/CampaignGrupoGroup";
import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";

interface Request {
  id: string | number;
  companyId: number;
}

const ShowCampaignGrupoService = async ({
  id,
  companyId
}: Request): Promise<CampaignGrupo> => {
  const campaign = await CampaignGrupo.findOne({
    where: {
      id,
      companyId
    },
    include: [
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["id", "name"]
      },
      {
        model: CampaignGrupoGroup,
        as: "groups"
      }
    ]
  });

  if (!campaign) {
    throw new AppError("Campanha não encontrada", 404);
  }

  return campaign;
};

export default ShowCampaignGrupoService;
