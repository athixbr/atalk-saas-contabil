import ControleComData from "../../models/ControleComData";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteControleComDataService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const item = await ControleComData.findOne({ where: { id, companyId } });

  if (!item) {
    throw new AppError("Controle com data não encontrado", 404);
  }

  await item.destroy();
};

export default DeleteControleComDataService;
