import ModalidadeFechamentoFiscal from "../../models/ModalidadeFechamentoFiscal";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateModalidadeFechamentoFiscalService = async ({
  nome,
  companyId,
}: Request): Promise<ModalidadeFechamentoFiscal> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do modalidade de fechamento fiscal é obrigatório", 400);
  }

  const modalidadeFechamentoFiscal = await ModalidadeFechamentoFiscal.create({
    nome: nome.trim(),
    companyId,
  });

  return modalidadeFechamentoFiscal;
};

export default CreateModalidadeFechamentoFiscalService;
