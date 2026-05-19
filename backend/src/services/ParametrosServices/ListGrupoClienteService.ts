import GrupoCliente from "../../models/GrupoCliente";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListGrupoClienteService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<GrupoCliente[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const grupoClientes = await GrupoCliente.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return grupoClientes;
};

export default ListGrupoClienteService;
