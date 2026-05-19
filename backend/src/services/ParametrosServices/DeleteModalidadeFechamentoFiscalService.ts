import ModalidadeFechamentoFiscal from "../../models/ModalidadeFechamentoFiscal";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteModalidadeFechamentoFiscalService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const modalidadeFechamentoFiscal = await ModalidadeFechamentoFiscal.findOne({
    where: { id, companyId },
  });

  if (!modalidadeFechamentoFiscal) {
    throw new AppError("Modalidade de fechamento fiscal não encontrado", 404);
  }

  await modalidadeFechamentoFiscal.destroy();
};

export default DeleteModalidadeFechamentoFiscalService;
