import ControleComData from "../../models/ControleComData";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;

interface Request {
  companyId: number;
  searchParam?: string;
}

const ListControleComDataService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<ControleComData[]> => {
  const whereCondition: any = { companyId };

  if (searchParam) {
    whereCondition.nome = { [Op.like]: `%${searchParam}%` };
  }

  return ControleComData.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });
};

export default ListControleComDataService;
