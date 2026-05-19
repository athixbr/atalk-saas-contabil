import TipoCliente from "../../models/TipoCliente";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateTipoClienteService = async ({
  nome,
  companyId,
}: Request): Promise<TipoCliente> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do tipo de cliente é obrigatório", 400);
  }

  const tipoCliente = await TipoCliente.create({
    nome: nome.trim(),
    companyId,
  });

  return tipoCliente;
};

export default CreateTipoClienteService;
