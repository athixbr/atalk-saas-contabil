import TipoCliente from "../../models/TipoCliente";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteTipoClienteService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const tipoCliente = await TipoCliente.findOne({
    where: { id, companyId },
  });

  if (!tipoCliente) {
    throw new AppError("Tipo de cliente não encontrado", 404);
  }

  await tipoCliente.destroy();
};

export default DeleteTipoClienteService;
