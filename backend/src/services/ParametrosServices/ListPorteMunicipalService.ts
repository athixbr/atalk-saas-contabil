import PorteMunicipal from "../../models/PorteMunicipal";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListPorteMunicipalService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<PorteMunicipal[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const items = await PorteMunicipal.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return items;
};

export default ListPorteMunicipalService;
