import Prazo from "../../models/Prazo";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeletePrazoService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const prazo = await Prazo.findOne({
    where: { id, companyId },
  });

  if (!prazo) {
    throw new AppError("Prazo não encontrado", 404);
  }

  await prazo.destroy();
};

export default DeletePrazoService;
