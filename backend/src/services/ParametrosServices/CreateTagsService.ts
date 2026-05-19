import TagsParametros from "../../models/TagsParametros";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  cor?: string;
  companyId: number;
}

const CreateTagsService = async ({
  nome,
  cor = "#A4CCCC",
  companyId,
}: Request): Promise<TagsParametros> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome da tag é obrigatório", 400);
  }

  const tags = await TagsParametros.create({
    nome: nome.trim(),
    cor,
    companyId,
  });

  return tags;
};

export default CreateTagsService;
