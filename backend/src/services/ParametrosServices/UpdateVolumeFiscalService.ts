import VolumeFiscal from "../../models/VolumeFiscal";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateVolumeFiscalService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<VolumeFiscal> => {
  const item = await VolumeFiscal.findOne({
    where: { id, companyId },
  });

  if (!item) {
    throw new AppError("Volume Fiscal não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do volume fiscal é obrigatório", 400);
  }

  await item.update({
    nome: nome.trim(),
  });

  return item;
};

export default UpdateVolumeFiscalService;
