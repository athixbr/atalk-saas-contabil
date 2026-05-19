import Segmento from "../../models/Segmento";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListSegmentoService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<Segmento[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const segmentos = await Segmento.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return segmentos;
};

export default ListSegmentoService;
