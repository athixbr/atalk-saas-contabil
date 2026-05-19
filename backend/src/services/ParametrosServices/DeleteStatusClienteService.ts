import StatusCliente from "../../models/StatusCliente";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteStatusClienteService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const statusCliente = await StatusCliente.findOne({
    where: { id, companyId },
  });

  if (!statusCliente) {
    throw new AppError("Status do cliente não encontrado", 404);
  }

  await statusCliente.destroy();
};

export default DeleteStatusClienteService;
