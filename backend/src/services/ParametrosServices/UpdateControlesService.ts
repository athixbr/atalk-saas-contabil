import Controles from "../../models/Controles";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateControlesService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<Controles> => {
  const controles = await Controles.findOne({
    where: { id, companyId },
  });

  if (!controles) {
    throw new AppError("Controle não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do controle é obrigatório", 400);
  }

  await controles.update({
    nome: nome.trim(),
  });

  return controles;
};

export default UpdateControlesService;
