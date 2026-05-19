import Prazo from "../../models/Prazo";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  cor: string;
  companyId: number;
}

const UpdatePrazoService = async ({
  id,
  nome,
  cor,
  companyId,
}: Request): Promise<Prazo> => {
  const prazo = await Prazo.findOne({
    where: { id, companyId },
  });

  if (!prazo) {
    throw new AppError("Prazo não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do prazo é obrigatório", 400);
  }

  if (!cor || !cor.trim()) {
    throw new AppError("A cor do prazo é obrigatória", 400);
  }

  await prazo.update({
    nome: nome.trim(),
    cor: cor.trim(),
  });

  return prazo;
};

export default UpdatePrazoService;
