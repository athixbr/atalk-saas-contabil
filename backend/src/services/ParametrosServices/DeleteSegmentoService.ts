import Segmento from "../../models/Segmento";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteSegmentoService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const segmento = await Segmento.findOne({
    where: { id, companyId },
  });

  if (!segmento) {
    throw new AppError("Segmento não encontrado", 404);
  }

  await segmento.destroy();
};

export default DeleteSegmentoService;
