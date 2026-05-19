import EscritorioGestor from "../../models/EscritorioGestor";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateEscritorioGestorService = async ({
  nome,
  companyId,
}: Request): Promise<EscritorioGestor> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do escritório gestor é obrigatório", 400);
  }

  const escritorioGestor = await EscritorioGestor.create({
    nome: nome.trim(),
    companyId,
  });

  return escritorioGestor;
};

export default CreateEscritorioGestorService;
