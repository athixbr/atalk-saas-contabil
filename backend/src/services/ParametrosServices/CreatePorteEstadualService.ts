import PorteEstadual from "../../models/PorteEstadual";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreatePorteEstadualService = async ({
  nome,
  companyId,
}: Request): Promise<PorteEstadual> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do porte estadual é obrigatório", 400);
  }

  const item = await PorteEstadual.create({
    nome: nome.trim(),
    companyId,
  });

  return item;
};

export default CreatePorteEstadualService;
