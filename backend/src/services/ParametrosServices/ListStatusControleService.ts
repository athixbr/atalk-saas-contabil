import StatusControle from "../../models/StatusControle";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListStatusControleService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<StatusControle[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const items = await StatusControle.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return items;
};

export default ListStatusControleService;
