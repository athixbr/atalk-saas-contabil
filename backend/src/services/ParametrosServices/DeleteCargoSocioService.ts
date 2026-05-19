import AppError from "../../errors/AppError";
import CargoSocio from "../../models/CargoSocio";

interface Request {
  id: number;
  companyId: number;
}

const DeleteCargoSocioService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const cargoSocio = await CargoSocio.findOne({
    where: { id, companyId },
  });

  if (!cargoSocio) {
    throw new AppError("Cargo de sócio não encontrado", 404);
  }

  await cargoSocio.destroy();
};

export default DeleteCargoSocioService;
