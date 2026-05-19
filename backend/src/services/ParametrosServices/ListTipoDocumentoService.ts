import TipoDocumento from "../../models/TipoDocumento";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListTipoDocumentoService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<TipoDocumento[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const tipoDocumentos = await TipoDocumento.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return tipoDocumentos;
};

export default ListTipoDocumentoService;
