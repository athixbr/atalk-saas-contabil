import EnvioCorrespondencia from "../../models/EnvioCorrespondencia";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateEnvioCorrespondenciaService = async ({
  nome,
  companyId,
}: Request): Promise<EnvioCorrespondencia> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do envio de correspondência é obrigatório", 400);
  }

  const envioCorrespondencia = await EnvioCorrespondencia.create({
    nome: nome.trim(),
    companyId,
  });

  return envioCorrespondencia;
};

export default CreateEnvioCorrespondenciaService;
