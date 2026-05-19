import TierCliente from "../../models/TierCliente";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateTierClienteService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<TierCliente> => {
  const item = await TierCliente.findOne({
    where: { id, companyId },
  });

  if (!item) {
    throw new AppError("Tier do Cliente não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do tier do cliente é obrigatório", 400);
  }

  await item.update({
    nome: nome.trim(),
  });

  return item;
};

export default UpdateTierClienteService;
