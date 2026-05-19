import TierCliente from "../../models/TierCliente";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteTierClienteService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const item = await TierCliente.findOne({
    where: { id, companyId },
  });

  if (!item) {
    throw new AppError("Tier do Cliente não encontrado", 404);
  }

  await item.destroy();
};

export default DeleteTierClienteService;
