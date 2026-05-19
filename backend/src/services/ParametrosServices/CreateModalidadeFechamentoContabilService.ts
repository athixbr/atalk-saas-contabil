import ModalidadeFechamentoContabil from "../../models/ModalidadeFechamentoContabil";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateModalidadeFechamentoContabilService = async ({
  nome,
  companyId,
}: Request): Promise<ModalidadeFechamentoContabil> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do modalidade de fechamento contábil é obrigatório", 400);
  }

  const modalidadeFechamentoContabil = await ModalidadeFechamentoContabil.create({
    nome: nome.trim(),
    companyId,
  });

  return modalidadeFechamentoContabil;
};

export default CreateModalidadeFechamentoContabilService;
