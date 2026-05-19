import ClusterCliente from "../../models/ClusterCliente";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateClusterClienteService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<ClusterCliente> => {
  const item = await ClusterCliente.findOne({
    where: { id, companyId },
  });

  if (!item) {
    throw new AppError("Cluster do Cliente não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do cluster do cliente é obrigatório", 400);
  }

  await item.update({
    nome: nome.trim(),
  });

  return item;
};

export default UpdateClusterClienteService;
