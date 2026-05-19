import TagsParametros from "../../models/TagsParametros";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListTagsService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<TagsParametros[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const tagss = await TagsParametros.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return tagss;
};

export default ListTagsService;
