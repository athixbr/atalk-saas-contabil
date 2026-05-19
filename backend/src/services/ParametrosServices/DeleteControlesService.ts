import Controles from "../../models/Controles";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteControlesService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const controles = await Controles.findOne({
    where: { id, companyId },
  });

  if (!controles) {
    throw new AppError("Controle não encontrado", 404);
  }

  await controles.destroy();
};

export default DeleteControlesService;
