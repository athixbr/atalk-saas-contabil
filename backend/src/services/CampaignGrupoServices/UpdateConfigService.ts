import CampaignGrupoConfig from "../../models/CampaignGrupoConfig";

interface Request {
  companyId: number;
  syncInterval?: number;
  autoSync?: boolean;
  maxGroupsPerCampaign?: number;
  delayBetweenMessages?: number;
}

const UpdateConfigService = async ({
  companyId,
  syncInterval,
  autoSync,
  maxGroupsPerCampaign,
  delayBetweenMessages
}: Request): Promise<CampaignGrupoConfig> => {
  const [config] = await CampaignGrupoConfig.findOrCreate({
    where: {
      companyId
    },
    defaults: {
      companyId,
      syncInterval: syncInterval || 60,
      autoSync: autoSync !== undefined ? autoSync : true,
      maxGroupsPerCampaign: maxGroupsPerCampaign || 50,
      delayBetweenMessages: delayBetweenMessages || 5
    }
  });

  // Atualizar valores se fornecidos
  if (syncInterval !== undefined) config.syncInterval = syncInterval;
  if (autoSync !== undefined) config.autoSync = autoSync;
  if (maxGroupsPerCampaign !== undefined) config.maxGroupsPerCampaign = maxGroupsPerCampaign;
  if (delayBetweenMessages !== undefined) config.delayBetweenMessages = delayBetweenMessages;

  await config.save();

  return config;
};

export default UpdateConfigService;
