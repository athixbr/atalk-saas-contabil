import VolumeBPO from "../../models/VolumeBPO";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateVolumeBPOService = async ({
  nome,
  companyId,
}: Request): Promise<VolumeBPO> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do volume BPO é obrigatório", 400);
  }

  const item = await VolumeBPO.create({
    nome: nome.trim(),
    companyId,
  });

  return item;
};

export default CreateVolumeBPOService;
