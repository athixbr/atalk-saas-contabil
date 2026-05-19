import ModalidadeFechamentoDP from "../../models/ModalidadeFechamentoDP";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateModalidadeFechamentoDPService = async ({
  nome,
  companyId,
}: Request): Promise<ModalidadeFechamentoDP> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do modalidade de fechamento DP é obrigatório", 400);
  }

  const modalidadeFechamentoDP = await ModalidadeFechamentoDP.create({
    nome: nome.trim(),
    companyId,
  });

  return modalidadeFechamentoDP;
};

export default CreateModalidadeFechamentoDPService;
