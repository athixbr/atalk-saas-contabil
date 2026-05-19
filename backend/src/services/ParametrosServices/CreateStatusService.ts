import Status from "../../models/Status";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  cor: string;
  companyId: number;
}

const CreateStatusService = async ({
  nome,
  cor,
  companyId,
}: Request): Promise<Status> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do status é obrigatório", 400);
  }

  if (!cor || !cor.trim()) {
    throw new AppError("A cor do status é obrigatória", 400);
  }

  const status = await Status.create({
    nome: nome.trim(),
    cor: cor.trim(),
    companyId,
  });

  return status;
};

export default CreateStatusService;
