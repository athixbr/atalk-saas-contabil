import LocalizacaoCliente from "../../models/LocalizacaoCliente";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListLocalizacaoClienteService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<LocalizacaoCliente[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const localizacaoClientes = await LocalizacaoCliente.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return localizacaoClientes;
};

export default ListLocalizacaoClienteService;
