import PeriodicidadeCliente from "../../models/PeriodicidadeCliente";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListPeriodicidadeClienteService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<PeriodicidadeCliente[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const periodicidadeClientes = await PeriodicidadeCliente.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return periodicidadeClientes;
};

export default ListPeriodicidadeClienteService;
