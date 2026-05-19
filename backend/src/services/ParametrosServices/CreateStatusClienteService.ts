import StatusCliente from "../../models/StatusCliente";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateStatusClienteService = async ({
  nome,
  companyId,
}: Request): Promise<StatusCliente> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do status do cliente é obrigatório", 400);
  }

  const statusCliente = await StatusCliente.create({
    nome: nome.trim(),
    companyId,
  });

  return statusCliente;
};

export default CreateStatusClienteService;
