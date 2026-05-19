import VolumeBPO from "../../models/VolumeBPO";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteVolumeBPOService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const item = await VolumeBPO.findOne({
    where: { id, companyId },
  });

  if (!item) {
    throw new AppError("Volume BPO não encontrado", 404);
  }

  await item.destroy();
};

export default DeleteVolumeBPOService;
