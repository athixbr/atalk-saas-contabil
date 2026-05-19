import VolumeContabil from "../../models/VolumeContabil";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateVolumeContabilService = async ({
  nome,
  companyId,
}: Request): Promise<VolumeContabil> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do volume contábil é obrigatório", 400);
  }

  const item = await VolumeContabil.create({
    nome: nome.trim(),
    companyId,
  });

  return item;
};

export default CreateVolumeContabilService;
