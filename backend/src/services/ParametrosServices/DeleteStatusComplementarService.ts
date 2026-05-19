import StatusComplementar from "../../models/StatusComplementar";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteStatusComplementarService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const statusComplementar = await StatusComplementar.findOne({
    where: { id, companyId },
  });

  if (!statusComplementar) {
    throw new AppError("Status complementar não encontrado", 404);
  }

  await statusComplementar.destroy();
};

export default DeleteStatusComplementarService;
