import RegimeTributarioFederal from "../../models/RegimeTributarioFederal";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateRegimeTributarioFederalService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<RegimeTributarioFederal> => {
  const regimeTributarioFederal = await RegimeTributarioFederal.findOne({
    where: { id, companyId },
  });

  if (!regimeTributarioFederal) {
    throw new AppError("Regime tributário federal não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do regime tributário federal é obrigatório", 400);
  }

  await regimeTributarioFederal.update({
    nome: nome.trim(),
  });

  return regimeTributarioFederal;
};

export default UpdateRegimeTributarioFederalService;
