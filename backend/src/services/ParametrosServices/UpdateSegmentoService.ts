import Segmento from "../../models/Segmento";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateSegmentoService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<Segmento> => {
  const segmento = await Segmento.findOne({
    where: { id, companyId },
  });

  if (!segmento) {
    throw new AppError("Segmento não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do segmento é obrigatório", 400);
  }

  await segmento.update({
    nome: nome.trim(),
  });

  return segmento;
};

export default UpdateSegmentoService;
