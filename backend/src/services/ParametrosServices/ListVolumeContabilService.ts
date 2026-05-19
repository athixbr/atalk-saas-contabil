import VolumeContabil from "../../models/VolumeContabil";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListVolumeContabilService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<VolumeContabil[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const items = await VolumeContabil.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return items;
};

export default ListVolumeContabilService;
