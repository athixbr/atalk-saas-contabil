import Holerite from "../../models/Holerite";
import AppError from "../../errors/AppError";

interface Request {
  userId: number;
  mesReferencia: number;
  anoReferencia: number;
  arquivoPdf: string;
  uploadedBy: number;
  companyId: number;
}

const CreateHoleriteService = async ({
  userId,
  mesReferencia,
  anoReferencia,
  arquivoPdf,
  uploadedBy,
  companyId,
}: Request): Promise<Holerite> => {
  if (mesReferencia < 1 || mesReferencia > 12) {
    throw new AppError("Mês inválido", 400);
  }

  // Verificar se já existe holerite para este mês/ano
  const existingHolerite = await Holerite.findOne({
    where: {
      userId,
      mesReferencia,
      anoReferencia,
      companyId,
    },
  });

  if (existingHolerite) {
    throw new AppError("Já existe um holerite para este período", 400);
  }

  const holerite = await Holerite.create({
    userId,
    mesReferencia,
    anoReferencia,
    arquivoPdf,
    uploadedBy,
    companyId,
    dataUpload: new Date(),
  });

  return holerite;
};

export default CreateHoleriteService;
