import CategoriaCliente from "../../models/CategoriaCliente";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListCategoriaClienteService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<CategoriaCliente[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const categoriaClientes = await CategoriaCliente.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return categoriaClientes;
};

export default ListCategoriaClienteService;
