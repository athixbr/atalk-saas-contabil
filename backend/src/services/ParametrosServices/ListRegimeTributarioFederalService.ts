import RegimeTributarioFederal from "../../models/RegimeTributarioFederal";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListRegimeTributarioFederalService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<RegimeTributarioFederal[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const regimeTributarioFederals = await RegimeTributarioFederal.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return regimeTributarioFederals;
};

export default ListRegimeTributarioFederalService;
