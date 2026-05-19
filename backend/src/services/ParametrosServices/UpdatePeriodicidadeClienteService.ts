import PeriodicidadeCliente from "../../models/PeriodicidadeCliente";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdatePeriodicidadeClienteService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<PeriodicidadeCliente> => {
  const periodicidadeCliente = await PeriodicidadeCliente.findOne({
    where: { id, companyId },
  });

  if (!periodicidadeCliente) {
    throw new AppError("Periodicidade do cliente não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do periodicidade do cliente é obrigatório", 400);
  }

  await periodicidadeCliente.update({
    nome: nome.trim(),
  });

  return periodicidadeCliente;
};

export default UpdatePeriodicidadeClienteService;
