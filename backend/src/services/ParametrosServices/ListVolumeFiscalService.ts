import VolumeFiscal from "../../models/VolumeFiscal";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListVolumeFiscalService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<VolumeFiscal[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const items = await VolumeFiscal.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return items;
};

export default ListVolumeFiscalService;
