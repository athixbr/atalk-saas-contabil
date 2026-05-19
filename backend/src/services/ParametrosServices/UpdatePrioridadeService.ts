import Prioridade from "../../models/Prioridade";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  cor: string;
  companyId: number;
}

const UpdatePrioridadeService = async ({
  id,
  nome,
  cor,
  companyId,
}: Request): Promise<Prioridade> => {
  const prioridade = await Prioridade.findOne({
    where: { id, companyId },
  });

  if (!prioridade) {
    throw new AppError("Prioridade não encontrada", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome da prioridade é obrigatório", 400);
  }

  if (!cor || !cor.trim()) {
    throw new AppError("A cor da prioridade é obrigatória", 400);
  }

  await prioridade.update({
    nome: nome.trim(),
    cor: cor.trim(),
  });

  return prioridade;
};

export default UpdatePrioridadeService;
