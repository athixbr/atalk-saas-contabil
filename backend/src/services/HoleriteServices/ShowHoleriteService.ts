import Holerite from "../../models/Holerite";
import User from "../../models/User";
import AppError from "../../errors/AppError";

interface Request {
  holeriteId: number;
  companyId: number;
}

const ShowHoleriteService = async ({
  holeriteId,
  companyId,
}: Request): Promise<Holerite> => {
  const holerite = await Holerite.findOne({
    where: { id: holeriteId, companyId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"],
      },
      {
        model: User,
        as: "uploadedByUser",
        attributes: ["id", "name"],
      },
    ],
  });

  if (!holerite) {
    throw new AppError("Holerite não encontrado", 404);
  }

  return holerite;
};

export default ShowHoleriteService;
