import PorteEstadual from "../../models/PorteEstadual";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeletePorteEstadualService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const item = await PorteEstadual.findOne({
    where: { id, companyId },
  });

  if (!item) {
    throw new AppError("Porte Estadual não encontrado", 404);
  }

  await item.destroy();
};

export default DeletePorteEstadualService;
