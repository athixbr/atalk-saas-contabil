import AppError from "../../errors/AppError";
import Esfera from "../../models/Esfera";

interface Request {
  nome: string;
  companyId: number;
}

const CreateEsferaService = async ({
  nome,
  companyId,
}: Request): Promise<Esfera> => {
  if (!nome || nome.trim() === "") {
    throw new AppError("O nome é obrigatório", 400);
  }

  const esfera = await Esfera.create({
    nome,
    companyId,
  });

  return esfera;
};

export default CreateEsferaService;
