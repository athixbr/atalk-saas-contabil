import VolumeFiscal from "../../models/VolumeFiscal";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteVolumeFiscalService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const item = await VolumeFiscal.findOne({
    where: { id, companyId },
  });

  if (!item) {
    throw new AppError("Volume Fiscal não encontrado", 404);
  }

  await item.destroy();
};

export default DeleteVolumeFiscalService;
