import Prioridade from "../../models/Prioridade";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListPrioridadesService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<Prioridade[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const prioridades = await Prioridade.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return prioridades;
};

export default ListPrioridadesService;
