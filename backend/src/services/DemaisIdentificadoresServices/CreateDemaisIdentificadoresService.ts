import DemaisIdentificadores from "../../models/DemaisIdentificadores";
import TipoDocumento from "../../models/TipoDocumento";
import AppError from "../../errors/AppError";

interface Request {
  clienteId: number;
  tipoDocumentoId: number;
  valor: string;
  companyId: number;
}

const CreateDemaisIdentificadoresService = async ({
  clienteId,
  tipoDocumentoId,
  valor,
  companyId,
}: Request): Promise<DemaisIdentificadores> => {
  // Validar se o tipo de documento existe
  const tipoDocumento = await TipoDocumento.findOne({
    where: {
      id: tipoDocumentoId,
      companyId,
    },
  });

  if (!tipoDocumento) {
    throw new AppError("Tipo de documento não encontrado", 404);
  }

  if (!valor || valor.trim() === "") {
    throw new AppError("O valor do identificador é obrigatório", 400);
  }

  const identificador = await DemaisIdentificadores.create({
    clienteId,
    tipoDocumentoId,
    valor: valor.trim(),
    companyId,
  });

  // Retornar com o relacionamento carregado
  const identificadorCompleto = await DemaisIdentificadores.findByPk(
    identificador.id,
    {
      include: [
        {
          model: TipoDocumento,
          as: "tipoDocumento",
          attributes: ["id", "nome"],
        },
      ],
    }
  );

  return identificadorCompleto!;
};

export default CreateDemaisIdentificadoresService;
