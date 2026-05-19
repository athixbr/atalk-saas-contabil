import SedeCliente from "../../models/SedeCliente";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateSedeClienteService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<SedeCliente> => {
  const sedeCliente = await SedeCliente.findOne({
    where: { id, companyId },
  });

  if (!sedeCliente) {
    throw new AppError("Sede do cliente não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do sede do cliente é obrigatório", 400);
  }

  await sedeCliente.update({
    nome: nome.trim(),
  });

  return sedeCliente;
};

export default UpdateSedeClienteService;
