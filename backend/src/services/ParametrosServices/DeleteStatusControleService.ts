import StatusControle from "../../models/StatusControle";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteStatusControleService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const item = await StatusControle.findOne({
    where: { id, companyId },
  });

  if (!item) {
    throw new AppError("Status do Controle não encontrado", 404);
  }

  await item.destroy();
};

export default DeleteStatusControleService;
