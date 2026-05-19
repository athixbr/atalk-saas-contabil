import VolumeDP from "../../models/VolumeDP";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateVolumeDPService = async ({
  nome,
  companyId,
}: Request): Promise<VolumeDP> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do volume DP é obrigatório", 400);
  }

  const item = await VolumeDP.create({
    nome: nome.trim(),
    companyId,
  });

  return item;
};

export default CreateVolumeDPService;
