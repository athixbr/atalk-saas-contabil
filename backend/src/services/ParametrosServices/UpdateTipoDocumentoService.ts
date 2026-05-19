import AppError from "../../errors/AppError";
import TipoDocumento from "../../models/TipoDocumento";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateTipoDocumentoService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<TipoDocumento> => {
  if (!nome || nome.trim() === "") {
    throw new AppError("O nome é obrigatório", 400);
  }

  const tipoDocumento = await TipoDocumento.findOne({
    where: { id, companyId },
  });

  if (!tipoDocumento) {
    throw new AppError("Tipo de Documento não encontrado", 404);
  }

  await tipoDocumento.update({ nome });

  return tipoDocumento;
};

export default UpdateTipoDocumentoService;
