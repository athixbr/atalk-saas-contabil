import RegimeTributarioMunicipal from "../../models/RegimeTributarioMunicipal";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteRegimeTributarioMunicipalService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const regimeTributarioMunicipal = await RegimeTributarioMunicipal.findOne({
    where: { id, companyId },
  });

  if (!regimeTributarioMunicipal) {
    throw new AppError("Regime tributário municipal não encontrado", 404);
  }

  await regimeTributarioMunicipal.destroy();
};

export default DeleteRegimeTributarioMunicipalService;
