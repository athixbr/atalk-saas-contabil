import VolumeDP from "../../models/VolumeDP";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateVolumeDPService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<VolumeDP> => {
  const item = await VolumeDP.findOne({
    where: { id, companyId },
  });

  if (!item) {
    throw new AppError("Volume DP não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do volume DP é obrigatório", 400);
  }

  await item.update({
    nome: nome.trim(),
  });

  return item;
};

export default UpdateVolumeDPService;
