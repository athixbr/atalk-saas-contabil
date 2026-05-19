import CargoSocio from "../../models/CargoSocio";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListCargoSocioService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<CargoSocio[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const cargoSocios = await CargoSocio.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return cargoSocios;
};

export default ListCargoSocioService;
