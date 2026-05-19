import PorteFederal from "../../models/PorteFederal";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreatePorteFederalService = async ({
  nome,
  companyId,
}: Request): Promise<PorteFederal> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do porte federal é obrigatório", 400);
  }

  const porteFederal = await PorteFederal.create({
    nome: nome.trim(),
    companyId,
  });

  return porteFederal;
};

export default CreatePorteFederalService;
