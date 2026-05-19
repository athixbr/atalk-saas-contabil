import Segmento from "../../models/Segmento";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateSegmentoService = async ({
  nome,
  companyId,
}: Request): Promise<Segmento> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do segmento é obrigatório", 400);
  }

  const segmento = await Segmento.create({
    nome: nome.trim(),
    companyId,
  });

  return segmento;
};

export default CreateSegmentoService;
