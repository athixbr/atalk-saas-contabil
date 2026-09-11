import { Request, Response } from "express";
import ListClienteVigenciasService from "../services/ClienteVigenciaServices/ListClienteVigenciasService";
import CreateClienteVigenciaService from "../services/ClienteVigenciaServices/CreateClienteVigenciaService";
import UpdateClienteVigenciaService from "../services/ClienteVigenciaServices/UpdateClienteVigenciaService";
import DeleteClienteVigenciaService from "../services/ClienteVigenciaServices/DeleteClienteVigenciaService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { clienteId } = req.params;

  const { vigencias } = await ListClienteVigenciasService({
    clienteId: parseInt(clienteId),
    companyId,
  });

  return res.json(vigencias);
};

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
  "atuacaoIds",
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
];

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { clienteId } = req.params;
  const { dataInicial, dataFinal, observacao } = req.body;

  const parametros: Record<string, any> = {};
  for (const field of PARAMETRO_FIELDS) {
    parametros[field] = req.body[field];
  }

  const vigencia = await CreateClienteVigenciaService({
    clienteId: parseInt(clienteId),
    dataInicial,
    dataFinal: dataFinal ?? null,
    observacao: observacao ?? null,
    ...parametros,
  });

  return res.status(201).json(vigencia);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { clienteId, vigenciaId } = req.params;
  const { dataInicial, dataFinal, observacao } = req.body;

  const parametros: Record<string, any> = {};
  for (const field of PARAMETRO_FIELDS) {
    if (req.body[field] !== undefined) {
      parametros[field] = req.body[field];
    }
  }

  const vigencia = await UpdateClienteVigenciaService({
    id: parseInt(vigenciaId),
    clienteId: parseInt(clienteId),
    dataInicial,
    dataFinal: dataFinal !== undefined ? (dataFinal ?? null) : undefined,
    observacao: observacao !== undefined ? (observacao ?? null) : undefined,
    ...parametros,
  });

  return res.json(vigencia);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { clienteId, vigenciaId } = req.params;

  await DeleteClienteVigenciaService({
    id: parseInt(vigenciaId),
    clienteId: parseInt(clienteId),
  });

  return res.status(200).json({ message: "Vigência removida com sucesso" });
};
