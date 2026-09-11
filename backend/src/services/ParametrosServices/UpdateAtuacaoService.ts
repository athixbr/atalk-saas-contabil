import Atuacao from "../../models/Atuacao";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateAtuacaoService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<Atuacao> => {
  const atuacao = await Atuacao.findOne({
    where: { id, companyId },
  });

  if (!atuacao) {
    throw new AppError("Atuação não encontrada", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome da atuação é obrigatório", 400);
  }

  await atuacao.update({
    nome: nome.trim(),
  });

  return atuacao;
};

export default UpdateAtuacaoService;
