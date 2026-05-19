import ClusterCliente from "../../models/ClusterCliente";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteClusterClienteService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const item = await ClusterCliente.findOne({
    where: { id, companyId },
  });

  if (!item) {
    throw new AppError("Cluster do Cliente não encontrado", 404);
  }

  await item.destroy();
};

export default DeleteClusterClienteService;
