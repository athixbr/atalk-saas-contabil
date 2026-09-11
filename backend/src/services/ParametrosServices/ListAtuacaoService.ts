import Atuacao from "../../models/Atuacao";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;

interface Request {
  companyId: number;
  searchParam?: string;
}

const ListAtuacaoService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<Atuacao[]> => {
  const whereCondition: any = { companyId };

  if (searchParam) {
    whereCondition.nome = { [Op.like]: `%${searchParam}%` };
  }

  return Atuacao.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });
};

export default ListAtuacaoService;
