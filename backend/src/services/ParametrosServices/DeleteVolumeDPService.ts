import VolumeDP from "../../models/VolumeDP";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteVolumeDPService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const item = await VolumeDP.findOne({
    where: { id, companyId },
  });

  if (!item) {
    throw new AppError("Volume DP não encontrado", 404);
  }

  await item.destroy();
};

export default DeleteVolumeDPService;
