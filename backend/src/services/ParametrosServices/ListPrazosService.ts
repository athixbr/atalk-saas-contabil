import Prazo from "../../models/Prazo";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListPrazosService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<Prazo[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const prazos = await Prazo.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return prazos;
};

export default ListPrazosService;
