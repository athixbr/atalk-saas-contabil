import PorteMunicipal from "../../models/PorteMunicipal";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeletePorteMunicipalService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const item = await PorteMunicipal.findOne({
    where: { id, companyId },
  });

  if (!item) {
    throw new AppError("Porte Municipal não encontrado", 404);
  }

  await item.destroy();
};

export default DeletePorteMunicipalService;
