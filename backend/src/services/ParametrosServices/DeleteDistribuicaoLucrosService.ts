import DistribuicaoLucros from "../../models/DistribuicaoLucros";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteDistribuicaoLucrosService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const distribuicaoLucros = await DistribuicaoLucros.findOne({
    where: { id, companyId },
  });

  if (!distribuicaoLucros) {
    throw new AppError("Distribuição de lucros não encontrado", 404);
  }

  await distribuicaoLucros.destroy();
};

export default DeleteDistribuicaoLucrosService;
