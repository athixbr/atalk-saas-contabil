import RegimeTributarioFederal from "../../models/RegimeTributarioFederal";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteRegimeTributarioFederalService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const regimeTributarioFederal = await RegimeTributarioFederal.findOne({
    where: { id, companyId },
  });

  if (!regimeTributarioFederal) {
    throw new AppError("Regime tributário federal não encontrado", 404);
  }

  await regimeTributarioFederal.destroy();
};

export default DeleteRegimeTributarioFederalService;
