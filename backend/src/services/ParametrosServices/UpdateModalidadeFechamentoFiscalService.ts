import ModalidadeFechamentoFiscal from "../../models/ModalidadeFechamentoFiscal";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateModalidadeFechamentoFiscalService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<ModalidadeFechamentoFiscal> => {
  const modalidadeFechamentoFiscal = await ModalidadeFechamentoFiscal.findOne({
    where: { id, companyId },
  });

  if (!modalidadeFechamentoFiscal) {
    throw new AppError("Modalidade de fechamento fiscal não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do modalidade de fechamento fiscal é obrigatório", 400);
  }

  await modalidadeFechamentoFiscal.update({
    nome: nome.trim(),
  });

  return modalidadeFechamentoFiscal;
};

export default UpdateModalidadeFechamentoFiscalService;
