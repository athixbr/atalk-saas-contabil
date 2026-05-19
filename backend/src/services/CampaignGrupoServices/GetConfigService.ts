import CampaignGrupoConfig from "../../models/CampaignGrupoConfig";

interface Request {
  companyId: number;
}

const GetConfigService = async ({
  companyId
}: Request): Promise<CampaignGrupoConfig | null> => {
  const config = await CampaignGrupoConfig.findOne({
    where: {
      companyId
    }
  });

  // Se não existir, retorna configuração padrão
  if (!config) {
    return null;
  }

  return config;
};

export default GetConfigService;
