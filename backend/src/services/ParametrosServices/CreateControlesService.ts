import Controles from "../../models/Controles";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateControlesService = async ({
  nome,
  companyId,
}: Request): Promise<Controles> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do controle é obrigatório", 400);
  }

  const controles = await Controles.create({
    nome: nome.trim(),
    companyId,
  });

  return controles;
};

export default CreateControlesService;
