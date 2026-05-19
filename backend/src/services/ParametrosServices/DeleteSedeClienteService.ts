import SedeCliente from "../../models/SedeCliente";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteSedeClienteService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const sedeCliente = await SedeCliente.findOne({
    where: { id, companyId },
  });

  if (!sedeCliente) {
    throw new AppError("Sede do cliente não encontrado", 404);
  }

  await sedeCliente.destroy();
};

export default DeleteSedeClienteService;
