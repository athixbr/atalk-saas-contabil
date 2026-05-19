import PorteEstadual from "../../models/PorteEstadual";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdatePorteEstadualService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<PorteEstadual> => {
  const item = await PorteEstadual.findOne({
    where: { id, companyId },
  });

  if (!item) {
    throw new AppError("Porte Estadual não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do porte estadual é obrigatório", 400);
  }

  await item.update({
    nome: nome.trim(),
  });

  return item;
};

export default UpdatePorteEstadualService;
