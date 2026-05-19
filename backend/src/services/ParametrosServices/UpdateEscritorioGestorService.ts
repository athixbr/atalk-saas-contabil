import EscritorioGestor from "../../models/EscritorioGestor";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateEscritorioGestorService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<EscritorioGestor> => {
  const escritorioGestor = await EscritorioGestor.findOne({
    where: { id, companyId },
  });

  if (!escritorioGestor) {
    throw new AppError("Escritório gestor não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do escritório gestor é obrigatório", 400);
  }

  await escritorioGestor.update({
    nome: nome.trim(),
  });

  return escritorioGestor;
};

export default UpdateEscritorioGestorService;
