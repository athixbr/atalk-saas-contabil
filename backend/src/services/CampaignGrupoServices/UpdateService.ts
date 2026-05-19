import CampaignGrupo from "../../models/CampaignGrupo";
import CampaignGrupoGroup from "../../models/CampaignGrupoGroup";
import WhatsappGroup from "../../models/WhatsappGroup";
import AppError from "../../errors/AppError";

interface Request {
  id: string | number;
  name?: string;
  message?: string;
  scheduledAt?: Date | string;
  groupIds?: string[];
  companyId: number;
}

const UpdateCampaignGrupoService = async ({
  id,
  name,
  message,
  scheduledAt,
  groupIds,
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

  // Não permitir edição de campanhas em processamento ou finalizadas
  if (campaign.status === "processing") {
    throw new AppError("Não é possível editar uma campanha em processamento");
  }

  if (campaign.status === "finished") {
    throw new AppError("Não é possível editar uma campanha finalizada");
  }

  // Atualizar dados básicos
  if (name) campaign.name = name;
  if (message) campaign.message = message;
  if (scheduledAt !== undefined) {
    campaign.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
  }

  await campaign.save();

  // Se mudou os grupos
  if (groupIds && groupIds.length > 0) {
    // Buscar informações dos grupos
    const groups = await WhatsappGroup.findAll({
      where: {
        groupId: groupIds,
        whatsappId: campaign.whatsappId,
        companyId,
        isActive: true
      }
    });

    if (groups.length === 0) {
      throw new AppError("Nenhum grupo válido encontrado");
    }

    // Remover grupos antigos
    await CampaignGrupoGroup.destroy({
      where: {
        campaignGrupoId: campaign.id
      }
    });

    // Criar novos registros
    await CampaignGrupoGroup.bulkCreate(
      groups.map(group => ({
        campaignGrupoId: campaign.id,
        groupId: group.groupId,
        groupName: group.name,
        participantsCount: group.participantsCount || 0,
        status: "pending"
      }))
    );

    // Atualizar contador
    campaign.groupsCount = groups.length;
    await campaign.save();
  }

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

export default UpdateCampaignGrupoService;
