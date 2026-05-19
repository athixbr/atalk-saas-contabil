import StatusComplementar from "../../models/StatusComplementar";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListStatusComplementarService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<StatusComplementar[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const statusComplementars = await StatusComplementar.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return statusComplementars;
};

export default ListStatusComplementarService;
