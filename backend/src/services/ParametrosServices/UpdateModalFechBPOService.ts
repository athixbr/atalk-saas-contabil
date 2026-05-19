import ModalFechBPO from "../../models/ModalFechBPO";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateModalFechBPOService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<ModalFechBPO> => {
  const item = await ModalFechBPO.findOne({
    where: { id, companyId },
  });

  if (!item) {
    throw new AppError("Modal Fech BPO não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do modal fech BPO é obrigatório", 400);
  }

  await item.update({
    nome: nome.trim(),
  });

  return item;
};

export default UpdateModalFechBPOService;
