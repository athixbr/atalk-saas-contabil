import TagServico from "../../models/TagServico";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateTagServicoService = async ({
  nome,
  companyId,
}: Request): Promise<TagServico> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome da tag de serviço é obrigatório", 400);
  }

  const tagServico = await TagServico.create({
    nome: nome.trim(),
    companyId,
  });

  return tagServico;
};

export default CreateTagServicoService;
