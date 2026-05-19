import AdiantamentoFolha from "../../models/AdiantamentoFolha";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateAdiantamentoFolhaService = async ({
  nome,
  companyId,
}: Request): Promise<AdiantamentoFolha> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do adiantamento da folha é obrigatório", 400);
  }

  const adiantamentoFolha = await AdiantamentoFolha.create({
    nome: nome.trim(),
    companyId,
  });

  return adiantamentoFolha;
};

export default CreateAdiantamentoFolhaService;
