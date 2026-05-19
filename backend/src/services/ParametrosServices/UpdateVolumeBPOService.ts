import VolumeBPO from "../../models/VolumeBPO";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateVolumeBPOService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<VolumeBPO> => {
  const item = await VolumeBPO.findOne({
    where: { id, companyId },
  });

  if (!item) {
    throw new AppError("Volume BPO não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do volume BPO é obrigatório", 400);
  }

  await item.update({
    nome: nome.trim(),
  });

  return item;
};

export default UpdateVolumeBPOService;
