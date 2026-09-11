import Atuacao from "../../models/Atuacao";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateAtuacaoService = async ({
  nome,
  companyId,
}: Request): Promise<Atuacao> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome da atuação é obrigatório", 400);
  }

  return Atuacao.create({
    nome: nome.trim(),
    companyId,
  });
};

export default CreateAtuacaoService;
