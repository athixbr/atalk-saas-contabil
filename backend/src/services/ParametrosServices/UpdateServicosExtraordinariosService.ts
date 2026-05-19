import ServicosExtraordinarios from "../../models/ServicosExtraordinarios";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateServicosExtraordinariosService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<ServicosExtraordinarios> => {
  const servicosExtraordinarios = await ServicosExtraordinarios.findOne({
    where: { id, companyId },
  });

  if (!servicosExtraordinarios) {
    throw new AppError("Serviço extraordinário não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do serviço extraordinário é obrigatório", 400);
  }

  await servicosExtraordinarios.update({
    nome: nome.trim(),
  });

  return servicosExtraordinarios;
};

export default UpdateServicosExtraordinariosService;
