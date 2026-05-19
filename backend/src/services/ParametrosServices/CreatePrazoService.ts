import Prazo from "../../models/Prazo";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  cor: string;
  companyId: number;
}

const CreatePrazoService = async ({
  nome,
  cor,
  companyId,
}: Request): Promise<Prazo> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do prazo é obrigatório", 400);
  }

  if (!cor || !cor.trim()) {
    throw new AppError("A cor do prazo é obrigatória", 400);
  }

  const prazo = await Prazo.create({
    nome: nome.trim(),
    cor: cor.trim(),
    companyId,
  });

  return prazo;
};

export default CreatePrazoService;
