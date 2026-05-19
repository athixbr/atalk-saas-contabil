import VolumeContabil from "../../models/VolumeContabil";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateVolumeContabilService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<VolumeContabil> => {
  const item = await VolumeContabil.findOne({
    where: { id, companyId },
  });

  if (!item) {
    throw new AppError("Volume Contábil não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do volume contábil é obrigatório", 400);
  }

  await item.update({
    nome: nome.trim(),
  });

  return item;
};

export default UpdateVolumeContabilService;
