import ModalidadeFechamentoDP from "../../models/ModalidadeFechamentoDP";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteModalidadeFechamentoDPService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const modalidadeFechamentoDP = await ModalidadeFechamentoDP.findOne({
    where: { id, companyId },
  });

  if (!modalidadeFechamentoDP) {
    throw new AppError("Modalidade de fechamento DP não encontrado", 404);
  }

  await modalidadeFechamentoDP.destroy();
};

export default DeleteModalidadeFechamentoDPService;
