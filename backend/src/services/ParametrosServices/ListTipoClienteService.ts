import TipoCliente from "../../models/TipoCliente";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListTipoClienteService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<TipoCliente[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const tipoClientes = await TipoCliente.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return tipoClientes;
};

export default ListTipoClienteService;
