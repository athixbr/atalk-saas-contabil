import TagServico from "../../models/TagServico";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateTagServicoService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<TagServico> => {
  const tagServico = await TagServico.findOne({
    where: { id, companyId },
  });

  if (!tagServico) {
    throw new AppError("Tag de serviço não encontrada", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome da tag de serviço é obrigatório", 400);
  }

  await tagServico.update({
    nome: nome.trim(),
  });

  return tagServico;
};

export default UpdateTagServicoService;
