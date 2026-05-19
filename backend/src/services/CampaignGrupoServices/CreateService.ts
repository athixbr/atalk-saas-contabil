import CampaignGrupo from "../../models/CampaignGrupo";
import CampaignGrupoGroup from "../../models/CampaignGrupoGroup";
import WhatsappGroup from "../../models/WhatsappGroup";
import AppError from "../../errors/AppError";

interface GroupData {
  groupId: string;
  groupName: string;
  participantsCount?: number;
}

interface Request {
  name: string;
  message: string;
  scheduledAt?: Date | string;
  whatsappId: number;
  groupIds: string[];
  companyId: number;
}

const CreateCampaignGrupoService = async ({
  name,
  message,
  scheduledAt,
  whatsappId,
  groupIds,
  companyId
}: Request): Promise<CampaignGrupo> => {
  if (!name || name.trim() === "") {
    throw new AppError("Nome da campanha é obrigatório");
  }

  if (!message || message.trim() === "") {
    throw new AppError("Mensagem é obrigatória");
  }

  if (!groupIds || groupIds.length === 0) {
    throw new AppError("Selecione pelo menos um grupo");
  }

  // Buscar informações dos grupos
  const groups = await WhatsappGroup.findAll({
    where: {
      groupId: groupIds,
      whatsappId,
      companyId,
      isActive: true
    }
  });

  if (groups.length === 0) {
    throw new AppError("Nenhum grupo válido encontrado");
  }

  // Criar campanha
  const campaign = await CampaignGrupo.create({
    name,
    message,
    scheduledAt: scheduledAt || null,
    whatsappId,
    companyId,
    groupsCount: groups.length,
    status: "pending"
  });

  // Criar registros de grupos
  const groupsData: GroupData[] = groups.map(group => ({
    groupId: group.groupId,
    groupName: group.name,
    participantsCount: group.participantsCount
  }));

  await CampaignGrupoGroup.bulkCreate(
    groupsData.map(group => ({
      campaignGrupoId: campaign.id,
      groupId: group.groupId,
      groupName: group.groupName,
      participantsCount: group.participantsCount || 0,
      status: "pending"
    }))
  );

  // Recarregar com associações
  await campaign.reload({
    include: [
      {
        model: CampaignGrupoGroup,
        as: "groups"
      }
    ]
  });

  return campaign;
};

export default CreateCampaignGrupoService;
