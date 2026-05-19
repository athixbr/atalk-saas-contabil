import GrupoServico from "../../models/GrupoServico";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListGrupoServicoService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<GrupoServico[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const grupoServicos = await GrupoServico.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return grupoServicos;
};

export default ListGrupoServicoService;
