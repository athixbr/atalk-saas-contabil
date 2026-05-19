import AppError from "../../errors/AppError";
import CargoSocio from "../../models/CargoSocio";

interface Request {
  nome: string;
  companyId: number;
}

const CreateCargoSocioService = async ({
  nome,
  companyId,
}: Request): Promise<CargoSocio> => {
  if (!nome || nome.trim() === "") {
    throw new AppError("O nome é obrigatório", 400);
  }

  const cargoSocio = await CargoSocio.create({
    nome,
    companyId,
  });

  return cargoSocio;
};

export default CreateCargoSocioService;
