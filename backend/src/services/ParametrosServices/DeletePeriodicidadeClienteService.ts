import PeriodicidadeCliente from "../../models/PeriodicidadeCliente";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeletePeriodicidadeClienteService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const periodicidadeCliente = await PeriodicidadeCliente.findOne({
    where: { id, companyId },
  });

  if (!periodicidadeCliente) {
    throw new AppError("Periodicidade do cliente não encontrado", 404);
  }

  await periodicidadeCliente.destroy();
};

export default DeletePeriodicidadeClienteService;
