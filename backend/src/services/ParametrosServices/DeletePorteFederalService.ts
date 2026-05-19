import PorteFederal from "../../models/PorteFederal";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeletePorteFederalService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const porteFederal = await PorteFederal.findOne({
    where: { id, companyId },
  });

  if (!porteFederal) {
    throw new AppError("Porte federal não encontrado", 404);
  }

  await porteFederal.destroy();
};

export default DeletePorteFederalService;
