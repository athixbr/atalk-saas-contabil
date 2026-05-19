import Prioridade from "../../models/Prioridade";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeletePrioridadeService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const prioridade = await Prioridade.findOne({
    where: { id, companyId },
  });

  if (!prioridade) {
    throw new AppError("Prioridade não encontrada", 404);
  }

  await prioridade.destroy();
};

export default DeletePrioridadeService;
