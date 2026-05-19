import ModalidadeFechamentoContabil from "../../models/ModalidadeFechamentoContabil";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteModalidadeFechamentoContabilService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const modalidadeFechamentoContabil = await ModalidadeFechamentoContabil.findOne({
    where: { id, companyId },
  });

  if (!modalidadeFechamentoContabil) {
    throw new AppError("Modalidade de fechamento contábil não encontrado", 404);
  }

  await modalidadeFechamentoContabil.destroy();
};

export default DeleteModalidadeFechamentoContabilService;
