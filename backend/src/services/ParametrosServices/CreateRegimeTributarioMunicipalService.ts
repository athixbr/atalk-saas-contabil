import RegimeTributarioMunicipal from "../../models/RegimeTributarioMunicipal";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateRegimeTributarioMunicipalService = async ({
  nome,
  companyId,
}: Request): Promise<RegimeTributarioMunicipal> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do regime tributário municipal é obrigatório", 400);
  }

  const regimeTributarioMunicipal = await RegimeTributarioMunicipal.create({
    nome: nome.trim(),
    companyId,
  });

  return regimeTributarioMunicipal;
};

export default CreateRegimeTributarioMunicipalService;
