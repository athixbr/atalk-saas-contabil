import RegimeTributarioFederal from "../../models/RegimeTributarioFederal";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateRegimeTributarioFederalService = async ({
  nome,
  companyId,
}: Request): Promise<RegimeTributarioFederal> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do regime tributário federal é obrigatório", 400);
  }

  const regimeTributarioFederal = await RegimeTributarioFederal.create({
    nome: nome.trim(),
    companyId,
  });

  return regimeTributarioFederal;
};

export default CreateRegimeTributarioFederalService;
