import ControleComData from "../../models/ControleComData";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  cor?: string;
  companyId: number;
}

const CreateControleComDataService = async ({
  nome,
  cor = "#f44336",
  companyId,
}: Request): Promise<ControleComData> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do controle com data é obrigatório", 400);
  }

  return ControleComData.create({
    nome: nome.trim(),
    cor,
    companyId,
  });
};

export default CreateControleComDataService;
