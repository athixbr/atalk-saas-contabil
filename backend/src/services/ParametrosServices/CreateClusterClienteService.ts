import ClusterCliente from "../../models/ClusterCliente";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateClusterClienteService = async ({
  nome,
  companyId,
}: Request): Promise<ClusterCliente> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do cluster do cliente é obrigatório", 400);
  }

  const item = await ClusterCliente.create({
    nome: nome.trim(),
    companyId,
  });

  return item;
};

export default CreateClusterClienteService;
