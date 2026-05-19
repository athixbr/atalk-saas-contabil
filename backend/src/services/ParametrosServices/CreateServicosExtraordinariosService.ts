import ServicosExtraordinarios from "../../models/ServicosExtraordinarios";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateServicosExtraordinariosService = async ({
  nome,
  companyId,
}: Request): Promise<ServicosExtraordinarios> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do serviço extraordinário é obrigatório", 400);
  }

  const servicosExtraordinarios = await ServicosExtraordinarios.create({
    nome: nome.trim(),
    companyId,
  });

  return servicosExtraordinarios;
};

export default CreateServicosExtraordinariosService;
