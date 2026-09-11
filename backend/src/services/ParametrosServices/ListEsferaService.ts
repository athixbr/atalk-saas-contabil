import Esfera from "../../models/Esfera";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListEsferaService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<Esfera[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const esferas = await Esfera.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return esferas;
};

export default ListEsferaService;
