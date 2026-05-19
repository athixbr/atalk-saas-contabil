import Prioridade from "../../models/Prioridade";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  cor: string;
  companyId: number;
}

const CreatePrioridadeService = async ({
  nome,
  cor,
  companyId,
}: Request): Promise<Prioridade> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome da prioridade é obrigatório", 400);
  }

  if (!cor || !cor.trim()) {
    throw new AppError("A cor da prioridade é obrigatória", 400);
  }

  const prioridade = await Prioridade.create({
    nome: nome.trim(),
    cor: cor.trim(),
    companyId,
  });

  return prioridade;
};

export default CreatePrioridadeService;
