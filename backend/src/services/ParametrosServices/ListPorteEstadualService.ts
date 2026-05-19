import PorteEstadual from "../../models/PorteEstadual";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListPorteEstadualService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<PorteEstadual[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const items = await PorteEstadual.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return items;
};

export default ListPorteEstadualService;
