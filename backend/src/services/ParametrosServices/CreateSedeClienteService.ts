import SedeCliente from "../../models/SedeCliente";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateSedeClienteService = async ({
  nome,
  companyId,
}: Request): Promise<SedeCliente> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do sede do cliente é obrigatório", 400);
  }

  const sedeCliente = await SedeCliente.create({
    nome: nome.trim(),
    companyId,
  });

  return sedeCliente;
};

export default CreateSedeClienteService;
