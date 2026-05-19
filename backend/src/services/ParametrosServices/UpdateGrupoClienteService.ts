import GrupoCliente from "../../models/GrupoCliente";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateGrupoClienteService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<GrupoCliente> => {
  const grupoCliente = await GrupoCliente.findOne({
    where: { id, companyId },
  });

  if (!grupoCliente) {
    throw new AppError("Grupo de cliente não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do grupo de cliente é obrigatório", 400);
  }

  await grupoCliente.update({
    nome: nome.trim(),
  });

  return grupoCliente;
};

export default UpdateGrupoClienteService;
