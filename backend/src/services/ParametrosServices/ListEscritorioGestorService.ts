import EscritorioGestor from "../../models/EscritorioGestor";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListEscritorioGestorService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<EscritorioGestor[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const escritoriosGestor = await EscritorioGestor.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return escritoriosGestor;
};

export default ListEscritorioGestorService;
