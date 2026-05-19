import ClusterCliente from "../../models/ClusterCliente";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListClusterClienteService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<ClusterCliente[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const items = await ClusterCliente.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return items;
};

export default ListClusterClienteService;
