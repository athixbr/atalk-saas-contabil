import { Op } from "sequelize";
import ClienteVigencia from "../../models/ClienteVigencia";
import Cliente from "../../models/Cliente";
import AppError from "../../errors/AppError";
import validarPeriodoVigencia from "./validarPeriodoVigencia";

interface Request {
  clienteId: number;
  dataInicial: string;
  dataFinal?: string | null;
  observacao?: string | null;
  // Classificação
  statusClienteId?: number | null;
  statusComplementarId?: number | null;
  periodicidadeClienteId?: number | null;
  tipoClienteId?: number | null;
  tierClienteId?: number | null;
  clusterClienteId?: number | null;
  categoriaClienteId?: number | null;
  sedeClienteId?: number | null;
  localizacaoClienteId?: number | null;
  segmentoId?: number | null;
  atuacaoId?: number | null;
  atuacaoIds?: number[] | null;
  tagsId?: number | null;
  adiantamentoFolhaId?: number | null;
  distribuicaoLucrosId?: number | null;
  // Enquadramento Tributário
  porteFederalId?: number | null;
  porteEstadualId?: number | null;
  porteMunicipalId?: number | null;
  regimeTributarioFederalId?: number | null;
  regimeTributarioEstadualId?: number | null;
  regimeTributarioMunicipalId?: number | null;
  // Enquadramento Operacional
  volumeFiscalId?: number | null;
  volumeContabilId?: number | null;
  volumeDPId?: number | null;
  volumeBPOId?: number | null;
  modalidadeFechamentoContabilId?: number | null;
  modalidadeFechamentoFiscalId?: number | null;
  modalidadeFechamentoDPId?: number | null;
  modalFechBPOId?: number | null;
}

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

const CreateClienteVigenciaService = async ({
  clienteId,
  dataInicial,
  dataFinal,
  observacao,
  statusClienteId,
  statusComplementarId,
  periodicidadeClienteId,
  tipoClienteId,
  tierClienteId,
  clusterClienteId,
  categoriaClienteId,
  sedeClienteId,
  localizacaoClienteId,
  segmentoId,
  atuacaoId,
  atuacaoIds,
  tagsId,
  adiantamentoFolhaId,
  distribuicaoLucrosId,
  porteFederalId,
  porteEstadualId,
  porteMunicipalId,
  regimeTributarioFederalId,
  regimeTributarioEstadualId,
  regimeTributarioMunicipalId,
  volumeFiscalId,
  volumeContabilId,
  volumeDPId,
  volumeBPOId,
  modalidadeFechamentoContabilId,
  modalidadeFechamentoFiscalId,
  modalidadeFechamentoDPId,
  modalFechBPOId,
}: Request): Promise<ClienteVigencia> => {
  const isAtiva = dataFinal === undefined || dataFinal === null;

  await validarPeriodoVigencia(clienteId, { dataInicial, dataFinal });

  if (isAtiva) {
    const vigenciaAtiva = await ClienteVigencia.findOne({
      where: {
        clienteId,
        dataFinal: { [Op.is]: null as any },
      },
    });

    if (vigenciaAtiva) {
      throw new AppError("Já existe uma vigência ativa para este cliente", 400);
    }
  }

  const parametros = {
    statusClienteId: toNumericOrNull(statusClienteId),
    statusComplementarId: toNumericOrNull(statusComplementarId),
    periodicidadeClienteId: toNumericOrNull(periodicidadeClienteId),
    tipoClienteId: toNumericOrNull(tipoClienteId),
    tierClienteId: toNumericOrNull(tierClienteId),
    clusterClienteId: toNumericOrNull(clusterClienteId),
    categoriaClienteId: toNumericOrNull(categoriaClienteId),
    sedeClienteId: toNumericOrNull(sedeClienteId),
    localizacaoClienteId: toNumericOrNull(localizacaoClienteId),
    segmentoId: toNumericOrNull(segmentoId),
    atuacaoId: toNumericOrNull(atuacaoId ?? toNumericArray(atuacaoIds)[0]),
    atuacaoIds: toNumericArray(atuacaoIds),
    tagsId: toNumericOrNull(tagsId),
    adiantamentoFolhaId: toNumericOrNull(adiantamentoFolhaId),
    distribuicaoLucrosId: toNumericOrNull(distribuicaoLucrosId),
    porteFederalId: toNumericOrNull(porteFederalId),
    porteEstadualId: toNumericOrNull(porteEstadualId),
    porteMunicipalId: toNumericOrNull(porteMunicipalId),
    regimeTributarioFederalId: toNumericOrNull(regimeTributarioFederalId),
    regimeTributarioEstadualId: toNumericOrNull(regimeTributarioEstadualId),
    regimeTributarioMunicipalId: toNumericOrNull(regimeTributarioMunicipalId),
    volumeFiscalId: toNumericOrNull(volumeFiscalId),
    volumeContabilId: toNumericOrNull(volumeContabilId),
    volumeDPId: toNumericOrNull(volumeDPId),
    volumeBPOId: toNumericOrNull(volumeBPOId),
    modalidadeFechamentoContabilId: toNumericOrNull(modalidadeFechamentoContabilId),
    modalidadeFechamentoFiscalId: toNumericOrNull(modalidadeFechamentoFiscalId),
    modalidadeFechamentoDPId: toNumericOrNull(modalidadeFechamentoDPId),
    modalFechBPOId: toNumericOrNull(modalFechBPOId),
  };

  const vigencia = await ClienteVigencia.create({
    clienteId,
    dataInicial,
    dataFinal: dataFinal ?? null,
    observacao: observacao ?? null,
    ...parametros,
  });

  if (isAtiva) {
    await Cliente.update(parametros, { where: { id: clienteId } });
  }

  return vigencia;
};

export default CreateClienteVigenciaService;
