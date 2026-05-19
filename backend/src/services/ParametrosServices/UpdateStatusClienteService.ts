import StatusCliente from "../../models/StatusCliente";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateStatusClienteService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<StatusCliente> => {
  const statusCliente = await StatusCliente.findOne({
    where: { id, companyId },
  });

  if (!statusCliente) {
    throw new AppError("Status do cliente não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do status do cliente é obrigatório", 400);
  }

  await statusCliente.update({
    nome: nome.trim(),
  });

  return statusCliente;
};

export default UpdateStatusClienteService;
