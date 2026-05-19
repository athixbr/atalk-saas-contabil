import SedeCliente from "../../models/SedeCliente";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListSedeClienteService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<SedeCliente[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const sedeClientes = await SedeCliente.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return sedeClientes;
};

export default ListSedeClienteService;
