import PerfilCargo from "../../models/PerfilCargo";
import User from "../../models/User";

interface Request {
  userId: number;
  companyId: number;
}

const ShowPerfilCargoService = async ({
  userId,
  companyId,
}: Request): Promise<PerfilCargo | null> => {
  const perfil = await PerfilCargo.findOne({
    where: { userId, companyId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email", "profile"],
      },
    ],
  });

  return perfil;
};

export default ShowPerfilCargoService;
