import Cliente from "../../models/Cliente";
import AppError from "../../errors/AppError";

interface Request {
  clienteId: number;
  companyId: number;
}

const DeleteClienteService = async ({
  clienteId,
  companyId,
}: Request): Promise<void> => {
  const cliente = await Cliente.findOne({
    where: { id: clienteId, companyId },
  });

  if (!cliente) {
    throw new AppError("Cliente não encontrado", 404);
  }

  await cliente.destroy();
};

export default DeleteClienteService;
