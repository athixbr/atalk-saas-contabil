import StatusComplementar from "../../models/StatusComplementar";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  cor: string;
  companyId: number;
}

const CreateStatusComplementarService = async ({
  nome,
  cor,
  companyId,
}: Request): Promise<StatusComplementar> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do status complementar é obrigatório", 400);
  }

  if (!cor || !cor.trim()) {
    throw new AppError("A cor do status complementar é obrigatória", 400);
  }

  const statusComplementar = await StatusComplementar.create({
    nome: nome.trim(),
    cor: cor.trim(),
    companyId,
  });

  return statusComplementar;
};

export default CreateStatusComplementarService;
