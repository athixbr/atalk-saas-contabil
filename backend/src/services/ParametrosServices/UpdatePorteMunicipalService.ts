import PorteMunicipal from "../../models/PorteMunicipal";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdatePorteMunicipalService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<PorteMunicipal> => {
  const item = await PorteMunicipal.findOne({
    where: { id, companyId },
  });

  if (!item) {
    throw new AppError("Porte Municipal não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do porte municipal é obrigatório", 400);
  }

  await item.update({
    nome: nome.trim(),
  });

  return item;
};

export default UpdatePorteMunicipalService;
