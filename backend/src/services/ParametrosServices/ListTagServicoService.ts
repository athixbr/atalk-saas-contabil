import TagServico from "../../models/TagServico";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListTagServicoService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<TagServico[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const tagsServico = await TagServico.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return tagsServico;
};

export default ListTagServicoService;
