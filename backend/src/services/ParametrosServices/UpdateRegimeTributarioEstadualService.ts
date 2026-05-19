import RegimeTributarioEstadual from "../../models/RegimeTributarioEstadual";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateRegimeTributarioEstadualService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<RegimeTributarioEstadual> => {
  const regimeTributarioEstadual = await RegimeTributarioEstadual.findOne({
    where: { id, companyId },
  });

  if (!regimeTributarioEstadual) {
    throw new AppError("Regime tributário estadual não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do regime tributário estadual é obrigatório", 400);
  }

  await regimeTributarioEstadual.update({
    nome: nome.trim(),
  });

  return regimeTributarioEstadual;
};

export default UpdateRegimeTributarioEstadualService;
