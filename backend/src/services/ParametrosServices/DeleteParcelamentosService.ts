import Parcelamentos from "../../models/Parcelamentos";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteParcelamentosService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const parcelamentos = await Parcelamentos.findOne({
    where: { id, companyId },
  });

  if (!parcelamentos) {
    throw new AppError("Parcelamento não encontrado", 404);
  }

  await parcelamentos.destroy();
};

export default DeleteParcelamentosService;
