import AppError from "../../errors/AppError";
import TipoDocumento from "../../models/TipoDocumento";

interface Request {
  id: number;
  companyId: number;
}

const DeleteTipoDocumentoService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const tipoDocumento = await TipoDocumento.findOne({
    where: { id, companyId },
  });

  if (!tipoDocumento) {
    throw new AppError("Tipo de Documento não encontrado", 404);
  }

  await tipoDocumento.destroy();
};

export default DeleteTipoDocumentoService;
