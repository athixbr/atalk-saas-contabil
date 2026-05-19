import EnvioCorrespondencia from "../../models/EnvioCorrespondencia";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListEnvioCorrespondenciaService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<EnvioCorrespondencia[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const envioCorrespondencias = await EnvioCorrespondencia.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return envioCorrespondencias;
};

export default ListEnvioCorrespondenciaService;
