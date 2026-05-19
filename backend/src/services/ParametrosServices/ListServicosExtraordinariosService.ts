import ServicosExtraordinarios from "../../models/ServicosExtraordinarios";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListServicosExtraordinariosService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<ServicosExtraordinarios[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const servicosExtraordinarioss = await ServicosExtraordinarios.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return servicosExtraordinarioss;
};

export default ListServicosExtraordinariosService;
