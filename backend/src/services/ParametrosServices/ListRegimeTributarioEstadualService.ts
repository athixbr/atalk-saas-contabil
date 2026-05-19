import RegimeTributarioEstadual from "../../models/RegimeTributarioEstadual";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListRegimeTributarioEstadualService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<RegimeTributarioEstadual[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const regimeTributarioEstaduals = await RegimeTributarioEstadual.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return regimeTributarioEstaduals;
};

export default ListRegimeTributarioEstadualService;
