import DistribuicaoLucros from "../../models/DistribuicaoLucros";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateDistribuicaoLucrosService = async ({
  nome,
  companyId,
}: Request): Promise<DistribuicaoLucros> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do distribuição de lucros é obrigatório", 400);
  }

  const distribuicaoLucros = await DistribuicaoLucros.create({
    nome: nome.trim(),
    companyId,
  });

  return distribuicaoLucros;
};

export default CreateDistribuicaoLucrosService;
