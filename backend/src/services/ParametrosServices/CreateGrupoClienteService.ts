import GrupoCliente from "../../models/GrupoCliente";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateGrupoClienteService = async ({
  nome,
  companyId,
}: Request): Promise<GrupoCliente> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do grupo de cliente é obrigatório", 400);
  }

  const grupoCliente = await GrupoCliente.create({
    nome: nome.trim(),
    companyId,
  });

  return grupoCliente;
};

export default CreateGrupoClienteService;
