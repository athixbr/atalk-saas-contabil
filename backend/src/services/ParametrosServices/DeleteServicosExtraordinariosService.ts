import ServicosExtraordinarios from "../../models/ServicosExtraordinarios";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteServicosExtraordinariosService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const servicosExtraordinarios = await ServicosExtraordinarios.findOne({
    where: { id, companyId },
  });

  if (!servicosExtraordinarios) {
    throw new AppError("Serviço extraordinário não encontrado", 404);
  }

  await servicosExtraordinarios.destroy();
};

export default DeleteServicosExtraordinariosService;
