import PorteFederal from "../../models/PorteFederal";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListPorteFederalService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<PorteFederal[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const porteFederais = await PorteFederal.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return porteFederais;
};

export default ListPorteFederalService;
