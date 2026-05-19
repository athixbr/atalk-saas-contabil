import TierCliente from "../../models/TierCliente";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListTierClienteService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<TierCliente[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const items = await TierCliente.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return items;
};

export default ListTierClienteService;
