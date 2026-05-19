import GrupoCliente from "../../models/GrupoCliente";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteGrupoClienteService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const grupoCliente = await GrupoCliente.findOne({
    where: { id, companyId },
  });

  if (!grupoCliente) {
    throw new AppError("Grupo de cliente não encontrado", 404);
  }

  await grupoCliente.destroy();
};

export default DeleteGrupoClienteService;
