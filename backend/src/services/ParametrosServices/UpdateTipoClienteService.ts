import TipoCliente from "../../models/TipoCliente";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateTipoClienteService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<TipoCliente> => {
  const tipoCliente = await TipoCliente.findOne({
    where: { id, companyId },
  });

  if (!tipoCliente) {
    throw new AppError("Tipo de cliente não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do tipo de cliente é obrigatório", 400);
  }

  await tipoCliente.update({
    nome: nome.trim(),
  });

  return tipoCliente;
};

export default UpdateTipoClienteService;
