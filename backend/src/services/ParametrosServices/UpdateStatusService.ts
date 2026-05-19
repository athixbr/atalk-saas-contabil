import Status from "../../models/Status";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  cor: string;
  companyId: number;
}

const UpdateStatusService = async ({
  id,
  nome,
  cor,
  companyId,
}: Request): Promise<Status> => {
  const status = await Status.findOne({
    where: { id, companyId },
  });

  if (!status) {
    throw new AppError("Status não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do status é obrigatório", 400);
  }

  if (!cor || !cor.trim()) {
    throw new AppError("A cor do status é obrigatória", 400);
  }

  await status.update({
    nome: nome.trim(),
    cor: cor.trim(),
  });

  return status;
};

export default UpdateStatusService;
