import EscritorioGestor from "../../models/EscritorioGestor";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteEscritorioGestorService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const escritorioGestor = await EscritorioGestor.findOne({
    where: { id, companyId },
  });

  if (!escritorioGestor) {
    throw new AppError("Escritório gestor não encontrado", 404);
  }

  await escritorioGestor.destroy();
};

export default DeleteEscritorioGestorService;
