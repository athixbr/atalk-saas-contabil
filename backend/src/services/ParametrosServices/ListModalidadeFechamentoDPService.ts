import ModalidadeFechamentoDP from "../../models/ModalidadeFechamentoDP";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListModalidadeFechamentoDPService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<ModalidadeFechamentoDP[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const modalidadeFechamentoDPs = await ModalidadeFechamentoDP.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return modalidadeFechamentoDPs;
};

export default ListModalidadeFechamentoDPService;
