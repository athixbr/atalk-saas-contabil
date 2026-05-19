import GrupoServico from "../../models/GrupoServico";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteGrupoServicoService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const grupoServico = await GrupoServico.findOne({
    where: { id, companyId },
  });

  if (!grupoServico) {
    throw new AppError("Grupo de serviço não encontrado", 404);
  }

  await grupoServico.destroy();
};

export default DeleteGrupoServicoService;
