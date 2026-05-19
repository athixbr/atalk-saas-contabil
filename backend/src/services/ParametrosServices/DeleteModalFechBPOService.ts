import ModalFechBPO from "../../models/ModalFechBPO";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteModalFechBPOService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const item = await ModalFechBPO.findOne({
    where: { id, companyId },
  });

  if (!item) {
    throw new AppError("Modal Fech BPO não encontrado", 404);
  }

  await item.destroy();
};

export default DeleteModalFechBPOService;
