import TagServico from "../../models/TagServico";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteTagServicoService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const tagServico = await TagServico.findOne({
    where: { id, companyId },
  });

  if (!tagServico) {
    throw new AppError("Tag de serviço não encontrada", 404);
  }

  await tagServico.destroy();
};

export default DeleteTagServicoService;
