import VolumeContabil from "../../models/VolumeContabil";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteVolumeContabilService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const item = await VolumeContabil.findOne({
    where: { id, companyId },
  });

  if (!item) {
    throw new AppError("Volume Contábil não encontrado", 404);
  }

  await item.destroy();
};

export default DeleteVolumeContabilService;
