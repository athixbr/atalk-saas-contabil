import VolumeFiscal from "../../models/VolumeFiscal";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateVolumeFiscalService = async ({
  nome,
  companyId,
}: Request): Promise<VolumeFiscal> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do volume fiscal é obrigatório", 400);
  }

  const item = await VolumeFiscal.create({
    nome: nome.trim(),
    companyId,
  });

  return item;
};

export default CreateVolumeFiscalService;
