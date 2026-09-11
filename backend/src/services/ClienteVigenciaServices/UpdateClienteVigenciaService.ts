import { Op } from "sequelize";
import ClienteVigencia from "../../models/ClienteVigencia";
import Cliente from "../../models/Cliente";
import AppError from "../../errors/AppError";
import validarPeriodoVigencia from "./validarPeriodoVigencia";

const PARAMETRO_FIELDS = [
  "statusClienteId",
  "statusComplementarId",
  "periodicidadeClienteId",
  "tipoClienteId",
  "tierClienteId",
  "clusterClienteId",
  "categoriaClienteId",
  "sedeClienteId",
  "localizacaoClienteId",
  "segmentoId",
  "atuacaoId",
  "tagsId",
  "adiantamentoFolhaId",
  "distribuicaoLucrosId",
  "porteFederalId",
  "porteEstadualId",
  "porteMunicipalId",
  "regimeTributarioFederalId",
  "regimeTributarioEstadualId",
  "regimeTributarioMunicipalId",
  "volumeFiscalId",
  "volumeContabilId",
  "volumeDPId",
  "volumeBPOId",
  "modalidadeFechamentoContabilId",
  "modalidadeFechamentoFiscalId",
  "modalidadeFechamentoDPId",
  "modalFechBPOId",
] as const;

type ParametroField = (typeof PARAMETRO_FIELDS)[number];

type Request = {
  id: number;
  clienteId: number;
  dataInicial?: string;
  dataFinal?: string | null;
  observacao?: string | null;
} & { [K in ParametroField]?: number | null } & { atuacaoIds?: number[] | null };

const toNumericOrNull = (value: any): number | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const num = Number(value);
  return isNaN(num) ? null : num;
};

const toNumericArray = (value: any): number[] => {
  if (!Array.isArray(value)) return [];
  return value.map(Number).filter(num => !isNaN(num));
};

const UpdateClienteVigenciaService = async (
  request: Request
): Promise<ClienteVigencia> => {
  const { id, clienteId, dataInicial, dataFinal, observacao } = request;

  const vigencia = await ClienteVigencia.findOne({
    where: { id, clienteId },
  });

  if (!vigencia) {
    throw new AppError("Vigência não encontrada", 404);
  }

  await validarPeriodoVigencia(
    clienteId,
    {
      dataInicial: dataInicial !== undefined ? dataInicial : vigencia.dataInicial,
      dataFinal: dataFinal !== undefined ? dataFinal : vigencia.dataFinal,
    },
    id
  );

  if (dataFinal === undefined || dataFinal === null) {
    const vigenciaAtiva = await ClienteVigencia.findOne({
      where: {
        clienteId,
        dataFinal: { [Op.is]: null as any },
        id: { [Op.ne]: id },
      },
    });

    if (vigenciaAtiva) {
      throw new AppError("Já existe uma vigência ativa para este cliente", 400);
    }
  }

  const parametrosUpdate: Record<string, any> = {};
  for (const field of PARAMETRO_FIELDS) {
    if (request[field] !== undefined) {
      parametrosUpdate[field] = toNumericOrNull(request[field]);
    }
  }
  if (request.atuacaoIds !== undefined) {
    const atuacaoIds = toNumericArray(request.atuacaoIds);
    (parametrosUpdate as any).atuacaoIds = atuacaoIds;
    parametrosUpdate.atuacaoId = atuacaoIds[0] ?? null;
  }

  await vigencia.update({
    ...(dataInicial !== undefined && { dataInicial }),
    dataFinal: dataFinal !== undefined ? (dataFinal ?? null) : vigencia.dataFinal,
    ...(observacao !== undefined && { observacao: observacao ?? null }),
    ...parametrosUpdate,
  });

  const isAtiva = !vigencia.dataFinal;
  if (isAtiva) {
    const parametrosAtuais: Record<string, any> = {};
    for (const field of PARAMETRO_FIELDS) {
      parametrosAtuais[field] = (vigencia as any)[field] ?? null;
    }
    parametrosAtuais.atuacaoIds = (vigencia as any).atuacaoIds || [];
    await Cliente.update(parametrosAtuais, { where: { id: clienteId } });
  }

  return vigencia;
};

export default UpdateClienteVigenciaService;
