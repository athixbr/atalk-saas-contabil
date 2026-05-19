import DistribuicaoLucros from "../../models/DistribuicaoLucros";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateDistribuicaoLucrosService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<DistribuicaoLucros> => {
  const distribuicaoLucros = await DistribuicaoLucros.findOne({
    where: { id, companyId },
  });

  if (!distribuicaoLucros) {
    throw new AppError("Distribuição de lucros não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do distribuição de lucros é obrigatório", 400);
  }

  await distribuicaoLucros.update({
    nome: nome.trim(),
  });

  return distribuicaoLucros;
};

export default UpdateDistribuicaoLucrosService;
