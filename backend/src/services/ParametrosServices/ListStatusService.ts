import Status from "../../models/Status";
import AppError from "../../errors/AppError";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListStatusService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<Status[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const status = await Status.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return status;
};

export default ListStatusService;
