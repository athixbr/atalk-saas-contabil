import PeriodicidadeCliente from "../../models/PeriodicidadeCliente";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreatePeriodicidadeClienteService = async ({
  nome,
  companyId,
}: Request): Promise<PeriodicidadeCliente> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do periodicidade do cliente é obrigatório", 400);
  }

  const periodicidadeCliente = await PeriodicidadeCliente.create({
    nome: nome.trim(),
    companyId,
  });

  return periodicidadeCliente;
};

export default CreatePeriodicidadeClienteService;
