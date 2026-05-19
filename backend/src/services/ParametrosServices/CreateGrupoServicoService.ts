import GrupoServico from "../../models/GrupoServico";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateGrupoServicoService = async ({
  nome,
  companyId,
}: Request): Promise<GrupoServico> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do grupo de serviço é obrigatório", 400);
  }

  const grupoServico = await GrupoServico.create({
    nome: nome.trim(),
    companyId,
  });

  return grupoServico;
};

export default CreateGrupoServicoService;
