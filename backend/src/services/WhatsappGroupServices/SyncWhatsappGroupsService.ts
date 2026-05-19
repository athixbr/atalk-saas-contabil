import WhatsappGroup from "../../models/WhatsappGroup";
import Whatsapp from "../../models/Whatsapp";
import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import moment from "moment";

interface Request {
  companyId: number;
  whatsappId?: number;
  forceSync?: boolean;
}

interface GroupData {
  groupId: string;
  name: string;
  description?: string;
  participantsCount: number;
  profilePicUrl?: string;
}

const SyncWhatsappGroupsService = async ({
  companyId,
  whatsappId,
  forceSync = false
}: Request): Promise<WhatsappGroup[]> => {
  // Buscar conexões ativas
  const whereCondition: any = {
    companyId,
    status: "CONNECTED"
  };

  if (whatsappId) {
    whereCondition.id = whatsappId;
  }

  const whatsapps = await Whatsapp.findAll({
    where: whereCondition
  });

  if (whatsapps.length === 0) {
    throw new AppError("Nenhuma conexão ativa encontrada", 404);
  }

  const allGroups: WhatsappGroup[] = [];

  for (const whatsapp of whatsapps) {
    try {
      // Verificar se precisa sincronizar (1 semana)
      const lastSync = await WhatsappGroup.findOne({
        where: {
          whatsappId: whatsapp.id,
          companyId
        },
        order: [["lastSyncAt", "DESC"]]
      });

      const oneWeekAgo = moment().subtract(7, "days").toDate();
      const needsSync = !lastSync || 
                        !lastSync.lastSyncAt || 
                        lastSync.lastSyncAt < oneWeekAgo || 
                        forceSync;

      if (!needsSync && !forceSync) {
        // Retornar grupos do cache
        const cachedGroups = await WhatsappGroup.findAll({
          where: {
            whatsappId: whatsapp.id,
            companyId,
            isActive: true
          }
        });
        allGroups.push(...cachedGroups);
        continue;
      }

      // Buscar grupos do WhatsApp
      const wbot = getWbot(whatsapp.id);
      const groups = await wbot.groupFetchAllParticipating();

      const groupIds = Object.keys(groups);

      for (const groupId of groupIds) {
        const group = groups[groupId];
        
        try {
          // Buscar foto do grupo
          let profilePicUrl = null;
          try {
            profilePicUrl = await wbot.profilePictureUrl(groupId, "image");
          } catch (err) {
            // Grupo sem foto
          }

          const groupData: GroupData = {
            groupId: groupId,
            name: group.subject || "Sem nome",
            description: group.desc || null,
            participantsCount: group.participants?.length || 0,
            profilePicUrl
          };

          // Atualizar ou criar no banco
          const [whatsappGroup, created] = await WhatsappGroup.findOrCreate({
            where: {
              groupId: groupData.groupId,
              whatsappId: whatsapp.id
            },
            defaults: {
              ...groupData,
              companyId,
              whatsappId: whatsapp.id,
              isActive: true,
              lastSyncAt: new Date()
            }
          });

          if (!created) {
            await whatsappGroup.update({
              name: groupData.name,
              description: groupData.description,
              participantsCount: groupData.participantsCount,
              profilePicUrl: groupData.profilePicUrl,
              isActive: true,
              lastSyncAt: new Date()
            });
          }

          allGroups.push(whatsappGroup);
        } catch (error) {
          console.error(`Erro ao processar grupo ${groupId}:`, error);
        }
      }

      // Marcar grupos que não existem mais como inativos
      const currentGroupIds = groupIds;
      await WhatsappGroup.update(
        { isActive: false },
        {
          where: {
            whatsappId: whatsapp.id,
            companyId,
            groupId: {
              [Op.notIn]: currentGroupIds
            }
          }
        }
      );

    } catch (error) {
      console.error(`Erro ao sincronizar grupos do WhatsApp ${whatsapp.id}:`, error);
    }
  }

  return allGroups;
};

export default SyncWhatsappGroupsService;
