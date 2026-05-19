import RegimeTributarioMunicipal from "../../models/RegimeTributarioMunicipal";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateRegimeTributarioMunicipalService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<RegimeTributarioMunicipal> => {
  const regimeTributarioMunicipal = await RegimeTributarioMunicipal.findOne({
    where: { id, companyId },
  });

  if (!regimeTributarioMunicipal) {
    throw new AppError("Regime tributário municipal não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do regime tributário municipal é obrigatório", 400);
  }

  await regimeTributarioMunicipal.update({
    nome: nome.trim(),
  });

  return regimeTributarioMunicipal;
};

export default UpdateRegimeTributarioMunicipalService;
