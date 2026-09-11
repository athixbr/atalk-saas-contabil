import Atuacao from "../../models/Atuacao";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteAtuacaoService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const atuacao = await Atuacao.findOne({
    where: { id, companyId },
  });

  if (!atuacao) {
    throw new AppError("Atuação não encontrada", 404);
  }

  await atuacao.destroy();
};

export default DeleteAtuacaoService;
