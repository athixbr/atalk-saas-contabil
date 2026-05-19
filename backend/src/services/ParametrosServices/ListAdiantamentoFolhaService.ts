import AdiantamentoFolha from "../../models/AdiantamentoFolha";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListAdiantamentoFolhaService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<AdiantamentoFolha[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const adiantamentoFolhas = await AdiantamentoFolha.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return adiantamentoFolhas;
};

export default ListAdiantamentoFolhaService;
