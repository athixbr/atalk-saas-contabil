import AppError from "../../errors/AppError";
import CargoSocio from "../../models/CargoSocio";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateCargoSocioService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<CargoSocio> => {
  if (!nome || nome.trim() === "") {
    throw new AppError("O nome é obrigatório", 400);
  }

  const cargoSocio = await CargoSocio.findOne({
    where: { id, companyId },
  });

  if (!cargoSocio) {
    throw new AppError("Cargo de sócio não encontrado", 404);
  }

  await cargoSocio.update({ nome });

  return cargoSocio;
};

export default UpdateCargoSocioService;
