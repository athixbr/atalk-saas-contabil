import RegimeTributarioEstadual from "../../models/RegimeTributarioEstadual";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateRegimeTributarioEstadualService = async ({
  nome,
  companyId,
}: Request): Promise<RegimeTributarioEstadual> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do regime tributário estadual é obrigatório", 400);
  }

  const regimeTributarioEstadual = await RegimeTributarioEstadual.create({
    nome: nome.trim(),
    companyId,
  });

  return regimeTributarioEstadual;
};

export default CreateRegimeTributarioEstadualService;
