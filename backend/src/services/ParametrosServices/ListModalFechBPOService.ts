import ModalFechBPO from "../../models/ModalFechBPO";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
}

const ListModalFechBPOService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<ModalFechBPO[]> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.like]: `%${searchParam}%`,
    };
  }

  const items = await ModalFechBPO.findAll({
    where: whereCondition,
    order: [["nome", "ASC"]],
  });

  return items;
};

export default ListModalFechBPOService;
