import AdiantamentoFolha from "../../models/AdiantamentoFolha";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateAdiantamentoFolhaService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<AdiantamentoFolha> => {
  const adiantamentoFolha = await AdiantamentoFolha.findOne({
    where: { id, companyId },
  });

  if (!adiantamentoFolha) {
    throw new AppError("Adiantamento da folha não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do adiantamento da folha é obrigatório", 400);
  }

  await adiantamentoFolha.update({
    nome: nome.trim(),
  });

  return adiantamentoFolha;
};

export default UpdateAdiantamentoFolhaService;
