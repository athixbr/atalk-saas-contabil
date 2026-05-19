import DemaisIdentificadores from "../../models/DemaisIdentificadores";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteDemaisIdentificadoresService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const identificador = await DemaisIdentificadores.findOne({
    where: {
      id,
      companyId,
    },
  });

  if (!identificador) {
    throw new AppError("Identificador não encontrado", 404);
  }

  await identificador.destroy();
};

export default DeleteDemaisIdentificadoresService;
