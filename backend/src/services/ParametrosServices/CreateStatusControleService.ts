import StatusControle from "../../models/StatusControle";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateStatusControleService = async ({
  nome,
  companyId,
}: Request): Promise<StatusControle> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do status do controle é obrigatório", 400);
  }

  const item = await StatusControle.create({
    nome: nome.trim(),
    companyId,
  });

  return item;
};

export default CreateStatusControleService;
