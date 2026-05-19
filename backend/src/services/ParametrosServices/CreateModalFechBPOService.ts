import ModalFechBPO from "../../models/ModalFechBPO";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateModalFechBPOService = async ({
  nome,
  companyId,
}: Request): Promise<ModalFechBPO> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do modal fech BPO é obrigatório", 400);
  }

  const item = await ModalFechBPO.create({
    nome: nome.trim(),
    companyId,
  });

  return item;
};

export default CreateModalFechBPOService;
