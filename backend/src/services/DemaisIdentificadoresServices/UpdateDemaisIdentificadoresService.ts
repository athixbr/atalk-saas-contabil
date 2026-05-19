import DemaisIdentificadores from "../../models/DemaisIdentificadores";
import TipoDocumento from "../../models/TipoDocumento";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  tipoDocumentoId?: number;
  valor?: string;
  companyId: number;
}

const UpdateDemaisIdentificadoresService = async ({
  id,
  tipoDocumentoId,
  valor,
  companyId,
}: Request): Promise<DemaisIdentificadores> => {
  const identificador = await DemaisIdentificadores.findOne({
    where: {
      id,
      companyId,
    },
  });

  if (!identificador) {
    throw new AppError("Identificador não encontrado", 404);
  }

  // Se mudou o tipo de documento, validar
  if (tipoDocumentoId && tipoDocumentoId !== identificador.tipoDocumentoId) {
    const tipoDocumento = await TipoDocumento.findOne({
      where: {
        id: tipoDocumentoId,
        companyId,
      },
    });

    if (!tipoDocumento) {
      throw new AppError("Tipo de documento não encontrado", 404);
    }
  }

  if (valor !== undefined && valor.trim() === "") {
    throw new AppError("O valor do identificador não pode ser vazio", 400);
  }

  await identificador.update({
    tipoDocumentoId: tipoDocumentoId || identificador.tipoDocumentoId,
    valor: valor ? valor.trim() : identificador.valor,
  });

  // Retornar com o relacionamento carregado
  const identificadorAtualizado = await DemaisIdentificadores.findByPk(id, {
    include: [
      {
        model: TipoDocumento,
        as: "tipoDocumento",
        attributes: ["id", "nome"],
      },
    ],
  });

  return identificadorAtualizado!;
};

export default UpdateDemaisIdentificadoresService;
