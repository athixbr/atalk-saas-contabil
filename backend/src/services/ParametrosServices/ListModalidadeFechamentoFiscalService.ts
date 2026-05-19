import ModalidadeFechamentoFiscal from "../../models/ModalidadeFechamentoFiscal";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListModalidadeFechamentoFiscalService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<ModalidadeFechamentoFiscal[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const modalidadeFechamentoFiscals = await ModalidadeFechamentoFiscal.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return modalidadeFechamentoFiscals;
};

export default ListModalidadeFechamentoFiscalService;
