import TierCliente from "../../models/TierCliente";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateTierClienteService = async ({
  nome,
  companyId,
}: Request): Promise<TierCliente> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do tier do cliente é obrigatório", 400);
  }

  const item = await TierCliente.create({
    nome: nome.trim(),
    companyId,
  });

  return item;
};

export default CreateTierClienteService;
