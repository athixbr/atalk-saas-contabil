import GrupoServico from "../../models/GrupoServico";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateGrupoServicoService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<GrupoServico> => {
  const grupoServico = await GrupoServico.findOne({
    where: { id, companyId },
  });

  if (!grupoServico) {
    throw new AppError("Grupo de serviço não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do grupo de serviço é obrigatório", 400);
  }

  await grupoServico.update({
    nome: nome.trim(),
  });

  return grupoServico;
};

export default UpdateGrupoServicoService;
