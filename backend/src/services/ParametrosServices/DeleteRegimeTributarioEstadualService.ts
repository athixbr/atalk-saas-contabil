import RegimeTributarioEstadual from "../../models/RegimeTributarioEstadual";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteRegimeTributarioEstadualService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const regimeTributarioEstadual = await RegimeTributarioEstadual.findOne({
    where: { id, companyId },
  });

  if (!regimeTributarioEstadual) {
    throw new AppError("Regime tributário estadual não encontrado", 404);
  }

  await regimeTributarioEstadual.destroy();
};

export default DeleteRegimeTributarioEstadualService;
