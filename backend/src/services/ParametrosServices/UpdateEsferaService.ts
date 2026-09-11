import AppError from "../../errors/AppError";
import Esfera from "../../models/Esfera";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateEsferaService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<Esfera> => {
  if (!nome || nome.trim() === "") {
    throw new AppError("O nome é obrigatório", 400);
  }

  const esfera = await Esfera.findOne({
    where: { id, companyId },
  });

  if (!esfera) {
    throw new AppError("Esfera não encontrada", 404);
  }

  await esfera.update({ nome });

  return esfera;
};

export default UpdateEsferaService;
