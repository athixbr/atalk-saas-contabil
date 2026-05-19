import RegimeTributarioMunicipal from "../../models/RegimeTributarioMunicipal";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListRegimeTributarioMunicipalService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<RegimeTributarioMunicipal[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const regimeTributarioMunicipals = await RegimeTributarioMunicipal.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return regimeTributarioMunicipals;
};

export default ListRegimeTributarioMunicipalService;
