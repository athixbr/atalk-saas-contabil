import EnvioCorrespondencia from "../../models/EnvioCorrespondencia";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateEnvioCorrespondenciaService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<EnvioCorrespondencia> => {
  const envioCorrespondencia = await EnvioCorrespondencia.findOne({
    where: { id, companyId },
  });

  if (!envioCorrespondencia) {
    throw new AppError("Envio de correspondência não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do envio de correspondência é obrigatório", 400);
  }

  await envioCorrespondencia.update({
    nome: nome.trim(),
  });

  return envioCorrespondencia;
};

export default UpdateEnvioCorrespondenciaService;
