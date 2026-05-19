import PorteFederal from "../../models/PorteFederal";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdatePorteFederalService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<PorteFederal> => {
  const porteFederal = await PorteFederal.findOne({
    where: { id, companyId },
  });

  if (!porteFederal) {
    throw new AppError("Porte federal não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do porte federal é obrigatório", 400);
  }

  await porteFederal.update({
    nome: nome.trim(),
  });

  return porteFederal;
};

export default UpdatePorteFederalService;
