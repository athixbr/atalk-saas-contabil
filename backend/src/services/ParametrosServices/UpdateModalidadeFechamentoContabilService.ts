import ModalidadeFechamentoContabil from "../../models/ModalidadeFechamentoContabil";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateModalidadeFechamentoContabilService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<ModalidadeFechamentoContabil> => {
  const modalidadeFechamentoContabil = await ModalidadeFechamentoContabil.findOne({
    where: { id, companyId },
  });

  if (!modalidadeFechamentoContabil) {
    throw new AppError("Modalidade de fechamento contábil não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do modalidade de fechamento contábil é obrigatório", 400);
  }

  await modalidadeFechamentoContabil.update({
    nome: nome.trim(),
  });

  return modalidadeFechamentoContabil;
};

export default UpdateModalidadeFechamentoContabilService;
