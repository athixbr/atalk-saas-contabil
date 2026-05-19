import ModalidadeFechamentoContabil from "../../models/ModalidadeFechamentoContabil";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListModalidadeFechamentoContabilService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<ModalidadeFechamentoContabil[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const modalidadeFechamentoContabils = await ModalidadeFechamentoContabil.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return modalidadeFechamentoContabils;
};

export default ListModalidadeFechamentoContabilService;
