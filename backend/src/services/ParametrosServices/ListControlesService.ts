import Controles from "../../models/Controles";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListControlesService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<Controles[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const controless = await Controles.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return controless;
};

export default ListControlesService;
