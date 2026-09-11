import AppError from "../../errors/AppError";
import Esfera from "../../models/Esfera";

interface Request {
  id: number;
  companyId: number;
}

const DeleteEsferaService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const esfera = await Esfera.findOne({
    where: { id, companyId },
  });

  if (!esfera) {
    throw new AppError("Esfera não encontrada", 404);
  }

  await esfera.destroy();
};

export default DeleteEsferaService;
