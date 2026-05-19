import DistribuicaoLucros from "../../models/DistribuicaoLucros";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListDistribuicaoLucrosService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<DistribuicaoLucros[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const distribuicaoLucross = await DistribuicaoLucros.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return distribuicaoLucross;
};

export default ListDistribuicaoLucrosService;
