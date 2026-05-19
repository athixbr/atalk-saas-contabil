import Holerite from "../../models/Holerite";
import User from "../../models/User";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  userId: number;
  companyId: number;
  limit?: number;
}

const ListHoleritesService = async ({
  userId,
  companyId,
  limit = 100,
}: Request): Promise<Holerite[]> => {
  const holerites = await Holerite.findAll({
    where: { userId, companyId },
    include: [
      {
        model: User,
        as: "uploader",
        attributes: ["id", "name"],
      },
    ],
    order: [
      ["anoReferencia", "DESC"],
      ["mesReferencia", "DESC"],
    ],
    limit,
  });

  return holerites;
};

export default ListHoleritesService;
