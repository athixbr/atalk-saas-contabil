import TagsParametros from "../../models/TagsParametros";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteTagsService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const tags = await TagsParametros.findOne({
    where: { id, companyId },
  });

  if (!tags) {
    throw new AppError("Tag não encontrada", 404);
  }

  await tags.destroy();
};

export default DeleteTagsService;
