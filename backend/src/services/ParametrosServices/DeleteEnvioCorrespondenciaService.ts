import EnvioCorrespondencia from "../../models/EnvioCorrespondencia";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteEnvioCorrespondenciaService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const envioCorrespondencia = await EnvioCorrespondencia.findOne({
    where: { id, companyId },
  });

  if (!envioCorrespondencia) {
    throw new AppError("Envio de correspondência não encontrado", 404);
  }

  await envioCorrespondencia.destroy();
};

export default DeleteEnvioCorrespondenciaService;
