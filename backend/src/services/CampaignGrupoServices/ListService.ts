import CampaignGrupo from "../../models/CampaignGrupo";
import CampaignGrupoGroup from "../../models/CampaignGrupoGroup";
import Whatsapp from "../../models/Whatsapp";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  searchParam?: string;
  pageNumber?: string | number;
  companyId: number;
}

interface Response {
  records: CampaignGrupo[];
  count: number;
  hasMore: boolean;
}

const ListCampaignGruposService = async ({
  searchParam = "",
  pageNumber = "1",
  companyId
}: Request): Promise<Response> => {
  const whereCondition: any = {
    companyId
  };

  if (searchParam) {
    whereCondition.name = {
      [Op.iLike]: `%${searchParam}%`
    };
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: records } = await CampaignGrupo.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["id", "name"]
      },
      {
        model: CampaignGrupoGroup,
        as: "groups",
        attributes: ["id", "groupId", "groupName", "status"]
      }
    ]
  });

  const hasMore = count > offset + records.length;

  return {
    records,
    count,
    hasMore
  };
};

export default ListCampaignGruposService;
