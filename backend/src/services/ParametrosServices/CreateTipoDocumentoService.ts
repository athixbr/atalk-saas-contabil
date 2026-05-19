import AppError from "../../errors/AppError";
import TipoDocumento from "../../models/TipoDocumento";

interface Request {
  nome: string;
  companyId: number;
}

const CreateTipoDocumentoService = async ({
  nome,
  companyId,
}: Request): Promise<TipoDocumento> => {
  if (!nome || nome.trim() === "") {
    throw new AppError("O nome é obrigatório", 400);
  }

  const tipoDocumento = await TipoDocumento.create({
    nome,
    companyId,
  });

  return tipoDocumento;
};

export default CreateTipoDocumentoService;
