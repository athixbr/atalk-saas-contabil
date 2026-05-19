import VolumeBPO from "../../models/VolumeBPO";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListVolumeBPOService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<VolumeBPO[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const items = await VolumeBPO.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return items;
};

export default ListVolumeBPOService;
