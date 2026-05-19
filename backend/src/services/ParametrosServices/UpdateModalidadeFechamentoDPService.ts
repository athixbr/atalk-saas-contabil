import ModalidadeFechamentoDP from "../../models/ModalidadeFechamentoDP";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateModalidadeFechamentoDPService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<ModalidadeFechamentoDP> => {
  const modalidadeFechamentoDP = await ModalidadeFechamentoDP.findOne({
    where: { id, companyId },
  });

  if (!modalidadeFechamentoDP) {
    throw new AppError("Modalidade de fechamento DP não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do modalidade de fechamento DP é obrigatório", 400);
  }

  await modalidadeFechamentoDP.update({
    nome: nome.trim(),
  });

  return modalidadeFechamentoDP;
};

export default UpdateModalidadeFechamentoDPService;
