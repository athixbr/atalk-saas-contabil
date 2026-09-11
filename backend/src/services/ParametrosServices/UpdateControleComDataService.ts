import ControleComData from "../../models/ControleComData";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  cor?: string;
  companyId: number;
}

const UpdateControleComDataService = async ({
  id,
  nome,
  cor,
  companyId,
}: Request): Promise<ControleComData> => {
  const item = await ControleComData.findOne({ where: { id, companyId } });

  if (!item) {
    throw new AppError("Controle com data não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do controle com data é obrigatório", 400);
  }

  await item.update({
    nome: nome.trim(),
    ...(cor !== undefined && { cor }),
  });
  return item;
};

export default UpdateControleComDataService;
