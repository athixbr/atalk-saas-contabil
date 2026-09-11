import StatusControle from "../../models/StatusControle";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  cor?: string;
  companyId: number;
}

const UpdateStatusControleService = async ({
  id,
  nome,
  cor,
  companyId,
}: Request): Promise<StatusControle> => {
  const item = await StatusControle.findOne({
    where: { id, companyId },
  });

  if (!item) {
    throw new AppError("Status do Controle não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do status do controle é obrigatório", 400);
  }

  await item.update({
    nome: nome.trim(),
    ...(cor !== undefined && { cor }),
  });

  return item;
};

export default UpdateStatusControleService;
