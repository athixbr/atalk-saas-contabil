import WhatsappGroup from "../../models/WhatsappGroup";
import Whatsapp from "../../models/Whatsapp";
import SyncWhatsappGroupsService from "./SyncWhatsappGroupsService";
import moment from "moment";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  whatsappId?: number;
  searchParam?: string;
}

interface Response {
  groups: WhatsappGroup[];
  needsSync: boolean;
}

const ListWhatsappGroupsService = async ({
  companyId,
  whatsappId,
  searchParam
}: Request): Promise<Response> => {
  const whereCondition: any = {
    companyId,
    isActive: true
  };

  if (whatsappId) {
    whereCondition.whatsappId = whatsappId;
  }

  if (searchParam) {
    whereCondition.name = {
      [Op.iLike]: `%${searchParam}%`
    };
  }

  // Buscar grupos do cache
  let groups = await WhatsappGroup.findAll({
    where: whereCondition,
    include: [
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["id", "name"]
      }
    ],
    order: [["name", "ASC"]]
  });

  // Verificar se precisa sincronizar (1 semana)
  const oneWeekAgo = moment().subtract(7, "days").toDate();
  let needsSync = false;

  if (groups.length === 0) {
    needsSync = true;
  } else {
    const oldestSync = groups.reduce((oldest, group) => {
      if (!group.lastSyncAt) return null;
      if (!oldest) return group.lastSyncAt;
      return group.lastSyncAt < oldest ? group.lastSyncAt : oldest;
    }, null as Date | null);

    if (!oldestSync || oldestSync < oneWeekAgo) {
      needsSync = true;
    }
  }

  // Se precisa sincronizar e não tem grupos, sincroniza automaticamente
  if (needsSync && groups.length === 0) {
    groups = await SyncWhatsappGroupsService({
      companyId,
      whatsappId,
      forceSync: false
    });
  }

  return {
    groups,
    needsSync
  };
};

export default ListWhatsappGroupsService;
