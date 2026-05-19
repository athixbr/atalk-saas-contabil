import TagsParametros from "../../models/TagsParametros";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  cor?: string;
  companyId: number;
}

const UpdateTagsService = async ({
  id,
  nome,
  cor,
  companyId,
}: Request): Promise<TagsParametros> => {
  const tags = await TagsParametros.findOne({
    where: { id, companyId },
  });

  if (!tags) {
    throw new AppError("Tag não encontrada", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome da tag é obrigatório", 400);
  }

  const updateData: any = {
    nome: nome.trim(),
  };

  if (cor) {
    updateData.cor = cor;
  }

  await tags.update(updateData);

  return tags;
};

export default UpdateTagsService;
