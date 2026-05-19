import PorteMunicipal from "../../models/PorteMunicipal";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreatePorteMunicipalService = async ({
  nome,
  companyId,
}: Request): Promise<PorteMunicipal> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do porte municipal é obrigatório", 400);
  }

  const item = await PorteMunicipal.create({
    nome: nome.trim(),
    companyId,
  });

  return item;
};

export default CreatePorteMunicipalService;
