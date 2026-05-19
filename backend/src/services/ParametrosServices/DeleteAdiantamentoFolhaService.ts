import AdiantamentoFolha from "../../models/AdiantamentoFolha";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteAdiantamentoFolhaService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const adiantamentoFolha = await AdiantamentoFolha.findOne({
    where: { id, companyId },
  });

  if (!adiantamentoFolha) {
    throw new AppError("Adiantamento da folha não encontrado", 404);
  }

  await adiantamentoFolha.destroy();
};

export default DeleteAdiantamentoFolhaService;
