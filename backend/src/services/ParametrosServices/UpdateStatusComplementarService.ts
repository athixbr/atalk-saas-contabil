import StatusComplementar from "../../models/StatusComplementar";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  cor: string;
  companyId: number;
}

const UpdateStatusComplementarService = async ({
  id,
  nome,
  cor,
  companyId,
}: Request): Promise<StatusComplementar> => {
  const statusComplementar = await StatusComplementar.findOne({
    where: { id, companyId },
  });

  if (!statusComplementar) {
    throw new AppError("Status complementar não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do status complementar é obrigatório", 400);
  }

  if (!cor || !cor.trim()) {
    throw new AppError("A cor do status complementar é obrigatória", 400);
  }

  await statusComplementar.update({
    nome: nome.trim(),
    cor: cor.trim(),
  });

  return statusComplementar;
};

export default UpdateStatusComplementarService;
