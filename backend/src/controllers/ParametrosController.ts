import { Request, Response } from "express";
import ListStatusService from "../services/ParametrosServices/ListStatusService";
import CreateStatusService from "../services/ParametrosServices/CreateStatusService";
import UpdateStatusService from "../services/ParametrosServices/UpdateStatusService";
import DeleteStatusService from "../services/ParametrosServices/DeleteStatusService";
import ListPrazosService from "../services/ParametrosServices/ListPrazosService";
import CreatePrazoService from "../services/ParametrosServices/CreatePrazoService";
import UpdatePrazoService from "../services/ParametrosServices/UpdatePrazoService";
import DeletePrazoService from "../services/ParametrosServices/DeletePrazoService";
import ListPrioridadesService from "../services/ParametrosServices/ListPrioridadesService";
import CreatePrioridadeService from "../services/ParametrosServices/CreatePrioridadeService";
import UpdatePrioridadeService from "../services/ParametrosServices/UpdatePrioridadeService";
import DeletePrioridadeService from "../services/ParametrosServices/DeletePrioridadeService";

// Novos Imports
import ListStatusComplementarService from "../services/ParametrosServices/ListStatusComplementarService";
import CreateStatusComplementarService from "../services/ParametrosServices/CreateStatusComplementarService";
import UpdateStatusComplementarService from "../services/ParametrosServices/UpdateStatusComplementarService";
import DeleteStatusComplementarService from "../services/ParametrosServices/DeleteStatusComplementarService";
import ListSegmentoService from "../services/ParametrosServices/ListSegmentoService";
import CreateSegmentoService from "../services/ParametrosServices/CreateSegmentoService";
import UpdateSegmentoService from "../services/ParametrosServices/UpdateSegmentoService";
import DeleteSegmentoService from "../services/ParametrosServices/DeleteSegmentoService";
import ListAtuacaoService from "../services/ParametrosServices/ListAtuacaoService";
import CreateAtuacaoService from "../services/ParametrosServices/CreateAtuacaoService";
import UpdateAtuacaoService from "../services/ParametrosServices/UpdateAtuacaoService";
import DeleteAtuacaoService from "../services/ParametrosServices/DeleteAtuacaoService";
import ListSedeClienteService from "../services/ParametrosServices/ListSedeClienteService";
import CreateSedeClienteService from "../services/ParametrosServices/CreateSedeClienteService";
import UpdateSedeClienteService from "../services/ParametrosServices/UpdateSedeClienteService";
import DeleteSedeClienteService from "../services/ParametrosServices/DeleteSedeClienteService";
import ListRegimeTributarioFederalService from "../services/ParametrosServices/ListRegimeTributarioFederalService";
import CreateRegimeTributarioFederalService from "../services/ParametrosServices/CreateRegimeTributarioFederalService";
import UpdateRegimeTributarioFederalService from "../services/ParametrosServices/UpdateRegimeTributarioFederalService";
import DeleteRegimeTributarioFederalService from "../services/ParametrosServices/DeleteRegimeTributarioFederalService";
import ListModalidadeFechamentoContabilService from "../services/ParametrosServices/ListModalidadeFechamentoContabilService";
import CreateModalidadeFechamentoContabilService from "../services/ParametrosServices/CreateModalidadeFechamentoContabilService";
import UpdateModalidadeFechamentoContabilService from "../services/ParametrosServices/UpdateModalidadeFechamentoContabilService";
import DeleteModalidadeFechamentoContabilService from "../services/ParametrosServices/DeleteModalidadeFechamentoContabilService";
import ListDistribuicaoLucrosService from "../services/ParametrosServices/ListDistribuicaoLucrosService";
import CreateDistribuicaoLucrosService from "../services/ParametrosServices/CreateDistribuicaoLucrosService";
import UpdateDistribuicaoLucrosService from "../services/ParametrosServices/UpdateDistribuicaoLucrosService";
import DeleteDistribuicaoLucrosService from "../services/ParametrosServices/DeleteDistribuicaoLucrosService";
import ListServicosExtraordinariosService from "../services/ParametrosServices/ListServicosExtraordinariosService";
import CreateServicosExtraordinariosService from "../services/ParametrosServices/CreateServicosExtraordinariosService";
import UpdateServicosExtraordinariosService from "../services/ParametrosServices/UpdateServicosExtraordinariosService";
import DeleteServicosExtraordinariosService from "../services/ParametrosServices/DeleteServicosExtraordinariosService";
import ListGrupoClienteService from "../services/ParametrosServices/ListGrupoClienteService";
import CreateGrupoClienteService from "../services/ParametrosServices/CreateGrupoClienteService";
import UpdateGrupoClienteService from "../services/ParametrosServices/UpdateGrupoClienteService";
import DeleteGrupoClienteService from "../services/ParametrosServices/DeleteGrupoClienteService";
import ListGrupoServicoService from "../services/ParametrosServices/ListGrupoServicoService";
import CreateGrupoServicoService from "../services/ParametrosServices/CreateGrupoServicoService";
import UpdateGrupoServicoService from "../services/ParametrosServices/UpdateGrupoServicoService";
import DeleteGrupoServicoService from "../services/ParametrosServices/DeleteGrupoServicoService";
import ListEscritorioGestorService from "../services/ParametrosServices/ListEscritorioGestorService";
import CreateEscritorioGestorService from "../services/ParametrosServices/CreateEscritorioGestorService";
import UpdateEscritorioGestorService from "../services/ParametrosServices/UpdateEscritorioGestorService";
import DeleteEscritorioGestorService from "../services/ParametrosServices/DeleteEscritorioGestorService";
import ListTagServicoService from "../services/ParametrosServices/ListTagServicoService";
import CreateTagServicoService from "../services/ParametrosServices/CreateTagServicoService";
import UpdateTagServicoService from "../services/ParametrosServices/UpdateTagServicoService";
import DeleteTagServicoService from "../services/ParametrosServices/DeleteTagServicoService";
import ListTipoDocumentoService from "../services/ParametrosServices/ListTipoDocumentoService";
import CreateTipoDocumentoService from "../services/ParametrosServices/CreateTipoDocumentoService";
import UpdateTipoDocumentoService from "../services/ParametrosServices/UpdateTipoDocumentoService";
import DeleteTipoDocumentoService from "../services/ParametrosServices/DeleteTipoDocumentoService";
import ListCargoSocioService from "../services/ParametrosServices/ListCargoSocioService";
import CreateCargoSocioService from "../services/ParametrosServices/CreateCargoSocioService";
import UpdateCargoSocioService from "../services/ParametrosServices/UpdateCargoSocioService";
import DeleteCargoSocioService from "../services/ParametrosServices/DeleteCargoSocioService";
import ListLocalizacaoClienteService from "../services/ParametrosServices/ListLocalizacaoClienteService";
import CreateLocalizacaoClienteService from "../services/ParametrosServices/CreateLocalizacaoClienteService";
import UpdateLocalizacaoClienteService from "../services/ParametrosServices/UpdateLocalizacaoClienteService";
import DeleteLocalizacaoClienteService from "../services/ParametrosServices/DeleteLocalizacaoClienteService";
import ListRegimeTributarioEstadualService from "../services/ParametrosServices/ListRegimeTributarioEstadualService";
import CreateRegimeTributarioEstadualService from "../services/ParametrosServices/CreateRegimeTributarioEstadualService";
import UpdateRegimeTributarioEstadualService from "../services/ParametrosServices/UpdateRegimeTributarioEstadualService";
import DeleteRegimeTributarioEstadualService from "../services/ParametrosServices/DeleteRegimeTributarioEstadualService";
import ListModalidadeFechamentoFiscalService from "../services/ParametrosServices/ListModalidadeFechamentoFiscalService";
import CreateModalidadeFechamentoFiscalService from "../services/ParametrosServices/CreateModalidadeFechamentoFiscalService";
import UpdateModalidadeFechamentoFiscalService from "../services/ParametrosServices/UpdateModalidadeFechamentoFiscalService";
import DeleteModalidadeFechamentoFiscalService from "../services/ParametrosServices/DeleteModalidadeFechamentoFiscalService";
import ListAdiantamentoFolhaService from "../services/ParametrosServices/ListAdiantamentoFolhaService";
import CreateAdiantamentoFolhaService from "../services/ParametrosServices/CreateAdiantamentoFolhaService";
import UpdateAdiantamentoFolhaService from "../services/ParametrosServices/UpdateAdiantamentoFolhaService";
import DeleteAdiantamentoFolhaService from "../services/ParametrosServices/DeleteAdiantamentoFolhaService";
import ListControlesService from "../services/ParametrosServices/ListControlesService";
import CreateControlesService from "../services/ParametrosServices/CreateControlesService";
import UpdateControlesService from "../services/ParametrosServices/UpdateControlesService";
import DeleteControlesService from "../services/ParametrosServices/DeleteControlesService";
import ListTipoClienteService from "../services/ParametrosServices/ListTipoClienteService";
import CreateTipoClienteService from "../services/ParametrosServices/CreateTipoClienteService";
import UpdateTipoClienteService from "../services/ParametrosServices/UpdateTipoClienteService";
import DeleteTipoClienteService from "../services/ParametrosServices/DeleteTipoClienteService";
import ListCategoriaClienteService from "../services/ParametrosServices/ListCategoriaClienteService";
import CreateCategoriaClienteService from "../services/ParametrosServices/CreateCategoriaClienteService";
import UpdateCategoriaClienteService from "../services/ParametrosServices/UpdateCategoriaClienteService";
import DeleteCategoriaClienteService from "../services/ParametrosServices/DeleteCategoriaClienteService";
import ListPeriodicidadeClienteService from "../services/ParametrosServices/ListPeriodicidadeClienteService";
import CreatePeriodicidadeClienteService from "../services/ParametrosServices/CreatePeriodicidadeClienteService";
import UpdatePeriodicidadeClienteService from "../services/ParametrosServices/UpdatePeriodicidadeClienteService";
import DeletePeriodicidadeClienteService from "../services/ParametrosServices/DeletePeriodicidadeClienteService";
import ListRegimeTributarioMunicipalService from "../services/ParametrosServices/ListRegimeTributarioMunicipalService";
import CreateRegimeTributarioMunicipalService from "../services/ParametrosServices/CreateRegimeTributarioMunicipalService";
import UpdateRegimeTributarioMunicipalService from "../services/ParametrosServices/UpdateRegimeTributarioMunicipalService";
import DeleteRegimeTributarioMunicipalService from "../services/ParametrosServices/DeleteRegimeTributarioMunicipalService";
import ListModalidadeFechamentoDPService from "../services/ParametrosServices/ListModalidadeFechamentoDPService";
import CreateModalidadeFechamentoDPService from "../services/ParametrosServices/CreateModalidadeFechamentoDPService";
import UpdateModalidadeFechamentoDPService from "../services/ParametrosServices/UpdateModalidadeFechamentoDPService";
import DeleteModalidadeFechamentoDPService from "../services/ParametrosServices/DeleteModalidadeFechamentoDPService";
import ListEnvioCorrespondenciaService from "../services/ParametrosServices/ListEnvioCorrespondenciaService";
import CreateEnvioCorrespondenciaService from "../services/ParametrosServices/CreateEnvioCorrespondenciaService";
import UpdateEnvioCorrespondenciaService from "../services/ParametrosServices/UpdateEnvioCorrespondenciaService";
import DeleteEnvioCorrespondenciaService from "../services/ParametrosServices/DeleteEnvioCorrespondenciaService";
import ListParcelamentosService from "../services/ParametrosServices/ListParcelamentosService";
import CreateParcelamentosService from "../services/ParametrosServices/CreateParcelamentosService";
import UpdateParcelamentosService from "../services/ParametrosServices/UpdateParcelamentosService";
import DeleteParcelamentosService from "../services/ParametrosServices/DeleteParcelamentosService";
import ShowParcelamentosService from "../services/ParametrosServices/ShowParcelamentosService";
import ListTagsService from "../services/ParametrosServices/ListTagsService";
import CreateTagsService from "../services/ParametrosServices/CreateTagsService";
import UpdateTagsService from "../services/ParametrosServices/UpdateTagsService";
import DeleteTagsService from "../services/ParametrosServices/DeleteTagsService";

// Imports dos Novos Parâmetros 2026
import ListStatusClienteService from "../services/ParametrosServices/ListStatusClienteService";
import CreateStatusClienteService from "../services/ParametrosServices/CreateStatusClienteService";
import UpdateStatusClienteService from "../services/ParametrosServices/UpdateStatusClienteService";
import DeleteStatusClienteService from "../services/ParametrosServices/DeleteStatusClienteService";
import ListPorteFederalService from "../services/ParametrosServices/ListPorteFederalService";
import CreatePorteFederalService from "../services/ParametrosServices/CreatePorteFederalService";
import UpdatePorteFederalService from "../services/ParametrosServices/UpdatePorteFederalService";
import DeletePorteFederalService from "../services/ParametrosServices/DeletePorteFederalService";
import ListPorteEstadualService from "../services/ParametrosServices/ListPorteEstadualService";
import CreatePorteEstadualService from "../services/ParametrosServices/CreatePorteEstadualService";
import UpdatePorteEstadualService from "../services/ParametrosServices/UpdatePorteEstadualService";
import DeletePorteEstadualService from "../services/ParametrosServices/DeletePorteEstadualService";
import ListPorteMunicipalService from "../services/ParametrosServices/ListPorteMunicipalService";
import CreatePorteMunicipalService from "../services/ParametrosServices/CreatePorteMunicipalService";
import UpdatePorteMunicipalService from "../services/ParametrosServices/UpdatePorteMunicipalService";
import DeletePorteMunicipalService from "../services/ParametrosServices/DeletePorteMunicipalService";
import ListTierClienteService from "../services/ParametrosServices/ListTierClienteService";
import CreateTierClienteService from "../services/ParametrosServices/CreateTierClienteService";
import UpdateTierClienteService from "../services/ParametrosServices/UpdateTierClienteService";
import DeleteTierClienteService from "../services/ParametrosServices/DeleteTierClienteService";
import ListClusterClienteService from "../services/ParametrosServices/ListClusterClienteService";
import CreateClusterClienteService from "../services/ParametrosServices/CreateClusterClienteService";
import UpdateClusterClienteService from "../services/ParametrosServices/UpdateClusterClienteService";
import DeleteClusterClienteService from "../services/ParametrosServices/DeleteClusterClienteService";
import ListVolumeFiscalService from "../services/ParametrosServices/ListVolumeFiscalService";
import CreateVolumeFiscalService from "../services/ParametrosServices/CreateVolumeFiscalService";
import UpdateVolumeFiscalService from "../services/ParametrosServices/UpdateVolumeFiscalService";
import DeleteVolumeFiscalService from "../services/ParametrosServices/DeleteVolumeFiscalService";
import ListVolumeContabilService from "../services/ParametrosServices/ListVolumeContabilService";
import CreateVolumeContabilService from "../services/ParametrosServices/CreateVolumeContabilService";
import UpdateVolumeContabilService from "../services/ParametrosServices/UpdateVolumeContabilService";
import DeleteVolumeContabilService from "../services/ParametrosServices/DeleteVolumeContabilService";
import ListVolumeDPService from "../services/ParametrosServices/ListVolumeDPService";
import CreateVolumeDPService from "../services/ParametrosServices/CreateVolumeDPService";
import UpdateVolumeDPService from "../services/ParametrosServices/UpdateVolumeDPService";
import DeleteVolumeDPService from "../services/ParametrosServices/DeleteVolumeDPService";
import ListVolumeBPOService from "../services/ParametrosServices/ListVolumeBPOService";
import CreateVolumeBPOService from "../services/ParametrosServices/CreateVolumeBPOService";
import UpdateVolumeBPOService from "../services/ParametrosServices/UpdateVolumeBPOService";
import DeleteVolumeBPOService from "../services/ParametrosServices/DeleteVolumeBPOService";
import ListModalFechBPOService from "../services/ParametrosServices/ListModalFechBPOService";
import CreateModalFechBPOService from "../services/ParametrosServices/CreateModalFechBPOService";
import UpdateModalFechBPOService from "../services/ParametrosServices/UpdateModalFechBPOService";
import DeleteModalFechBPOService from "../services/ParametrosServices/DeleteModalFechBPOService";
import ListStatusControleService from "../services/ParametrosServices/ListStatusControleService";
import CreateStatusControleService from "../services/ParametrosServices/CreateStatusControleService";
import UpdateStatusControleService from "../services/ParametrosServices/UpdateStatusControleService";
import DeleteStatusControleService from "../services/ParametrosServices/DeleteStatusControleService";
import ListControleComDataService from "../services/ParametrosServices/ListControleComDataService";
import CreateControleComDataService from "../services/ParametrosServices/CreateControleComDataService";
import UpdateControleComDataService from "../services/ParametrosServices/UpdateControleComDataService";
import DeleteControleComDataService from "../services/ParametrosServices/DeleteControleComDataService";
import ListEsferaService from "../services/ParametrosServices/ListEsferaService";
import CreateEsferaService from "../services/ParametrosServices/CreateEsferaService";
import UpdateEsferaService from "../services/ParametrosServices/UpdateEsferaService";
import DeleteEsferaService from "../services/ParametrosServices/DeleteEsferaService";
import TipoConta from "../models/TipoConta";
import { Op } from "sequelize";

// ========== STATUS ==========
export const listStatus = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };

  const status = await ListStatusService({
    companyId,
    searchParam,
  });

  return res.status(200).json(status);
};

export const createStatus = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome, cor } = req.body;

  const status = await CreateStatusService({
    nome,
    cor,
    companyId,
  });

  return res.status(201).json(status);
};

export const updateStatus = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome, cor } = req.body;

  const status = await UpdateStatusService({
    id: parseInt(id),
    nome,
    cor,
    companyId,
  });

  return res.status(200).json(status);
};

export const deleteStatus = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteStatusService({
    id: parseInt(id),
    companyId,
  });

  return res.status(200).json({ message: "Status excluído com sucesso" });
};

// ========== PRAZOS ==========
export const listPrazos = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };

  const prazos = await ListPrazosService({
    companyId,
    searchParam,
  });

  return res.status(200).json(prazos);
};

export const createPrazo = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome, cor } = req.body;

  const prazo = await CreatePrazoService({
    nome,
    cor,
    companyId,
  });

  return res.status(201).json(prazo);
};

export const updatePrazo = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome, cor } = req.body;

  const prazo = await UpdatePrazoService({
    id: parseInt(id),
    nome,
    cor,
    companyId,
  });

  return res.status(200).json(prazo);
};

export const deletePrazo = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeletePrazoService({
    id: parseInt(id),
    companyId,
  });

  return res.status(200).json({ message: "Prazo excluído com sucesso" });
};

// ========== PRIORIDADES ==========
export const listPrioridades = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };

  const prioridades = await ListPrioridadesService({
    companyId,
    searchParam,
  });

  return res.status(200).json(prioridades);
};

export const createPrioridade = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome, cor } = req.body;

  const prioridade = await CreatePrioridadeService({
    nome,
    cor,
    companyId,
  });

  return res.status(201).json(prioridade);
};

export const updatePrioridade = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome, cor } = req.body;

  const prioridade = await UpdatePrioridadeService({
    id: parseInt(id),
    nome,
    cor,
    companyId,
  });

  return res.status(200).json(prioridade);
};

export const deletePrioridade = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeletePrioridadeService({
    id: parseInt(id),
    companyId,
  });

  return res.status(200).json({ message: "Prioridade excluída com sucesso" });
};

// ========== STATUS COMPLEMENTAR ==========
export const listStatusComplementar = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListStatusComplementarService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createStatusComplementar = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome, cor } = req.body;
  const item = await CreateStatusComplementarService({ nome, cor, companyId });
  return res.status(201).json(item);
};

export const updateStatusComplementar = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome, cor } = req.body;
  const item = await UpdateStatusComplementarService({ id: parseInt(id), nome, cor, companyId });
  return res.status(200).json(item);
};

export const deleteStatusComplementar = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteStatusComplementarService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Status complementar excluído com sucesso" });
};

// ========== SEGMENTO ==========
export const listSegmento = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListSegmentoService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createSegmento = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateSegmentoService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateSegmento = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateSegmentoService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteSegmento = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteSegmentoService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Segmento excluído com sucesso" });
};

// ========== ATUAÇÃO ==========
export const listAtuacao = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListAtuacaoService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createAtuacao = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateAtuacaoService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateAtuacao = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateAtuacaoService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteAtuacao = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteAtuacaoService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Atuação excluída com sucesso" });
};

// ========== SEDE CLIENTE ==========
export const listSedeCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListSedeClienteService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createSedeCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateSedeClienteService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateSedeCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateSedeClienteService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteSedeCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteSedeClienteService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Sede do cliente excluída com sucesso" });
};

// ========== REGIME TRIBUTARIO FEDERAL ==========
export const listRegimeTributarioFederal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListRegimeTributarioFederalService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createRegimeTributarioFederal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateRegimeTributarioFederalService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateRegimeTributarioFederal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateRegimeTributarioFederalService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteRegimeTributarioFederal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteRegimeTributarioFederalService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Regime tributário federal excluído com sucesso" });
};

// ========== MODALIDADE FECHAMENTO CONTABIL ==========
export const listModalidadeFechamentoContabil = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListModalidadeFechamentoContabilService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createModalidadeFechamentoContabil = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateModalidadeFechamentoContabilService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateModalidadeFechamentoContabil = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateModalidadeFechamentoContabilService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteModalidadeFechamentoContabil = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteModalidadeFechamentoContabilService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Modalidade de fechamento contábil excluída com sucesso" });
};

// ========== DISTRIBUICAO LUCROS ==========
export const listDistribuicaoLucros = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListDistribuicaoLucrosService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createDistribuicaoLucros = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateDistribuicaoLucrosService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateDistribuicaoLucros = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateDistribuicaoLucrosService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteDistribuicaoLucros = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteDistribuicaoLucrosService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Distribuição de lucros excluída com sucesso" });
};

// ========== SERVICOS EXTRAORDINARIOS ==========
export const listServicosExtraordinarios = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListServicosExtraordinariosService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createServicosExtraordinarios = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateServicosExtraordinariosService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateServicosExtraordinarios = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateServicosExtraordinariosService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteServicosExtraordinarios = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteServicosExtraordinariosService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Serviço extraordinário excluído com sucesso" });
};

// ========== GRUPO CLIENTE ==========
export const listGrupoCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListGrupoClienteService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createGrupoCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateGrupoClienteService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateGrupoCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateGrupoClienteService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteGrupoCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteGrupoClienteService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Grupo de cliente excluído com sucesso" });
};

// ========== GRUPO SERVICO ==========
export const listGrupoServico = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListGrupoServicoService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createGrupoServico = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateGrupoServicoService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateGrupoServico = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateGrupoServicoService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteGrupoServico = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteGrupoServicoService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Grupo de serviço excluído com sucesso" });
};

// ========== ESCRITORIO GESTOR ==========
export const listEscritorioGestor = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListEscritorioGestorService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createEscritorioGestor = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateEscritorioGestorService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateEscritorioGestor = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateEscritorioGestorService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteEscritorioGestor = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteEscritorioGestorService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Escritório gestor excluído com sucesso" });
};

// ========== TAG SERVICO ==========
export const listTagServico = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListTagServicoService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createTagServico = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateTagServicoService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateTagServico = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateTagServicoService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteTagServico = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteTagServicoService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Tag de serviço excluída com sucesso" });
};

// ========== TIPO DOCUMENTO ==========
export const listTipoDocumento = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListTipoDocumentoService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createTipoDocumento = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateTipoDocumentoService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateTipoDocumento = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateTipoDocumentoService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteTipoDocumento = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteTipoDocumentoService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Tipo de documento excluído com sucesso" });
};

// ========== CARGO SOCIO ==========
export const listCargoSocio = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListCargoSocioService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createCargoSocio = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateCargoSocioService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateCargoSocio = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateCargoSocioService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteCargoSocio = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteCargoSocioService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Cargo de sócio excluído com sucesso" });
};

// ========== LOCALIZACAO CLIENTE ==========
export const listLocalizacaoCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListLocalizacaoClienteService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createLocalizacaoCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateLocalizacaoClienteService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateLocalizacaoCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateLocalizacaoClienteService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteLocalizacaoCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteLocalizacaoClienteService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Localização do cliente excluída com sucesso" });
};

// ========== REGIME TRIBUTARIO ESTADUAL ==========
export const listRegimeTributarioEstadual = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListRegimeTributarioEstadualService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createRegimeTributarioEstadual = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateRegimeTributarioEstadualService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateRegimeTributarioEstadual = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateRegimeTributarioEstadualService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteRegimeTributarioEstadual = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteRegimeTributarioEstadualService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Regime tributário estadual excluído com sucesso" });
};

// ========== MODALIDADE FECHAMENTO FISCAL ==========
export const listModalidadeFechamentoFiscal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListModalidadeFechamentoFiscalService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createModalidadeFechamentoFiscal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateModalidadeFechamentoFiscalService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateModalidadeFechamentoFiscal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateModalidadeFechamentoFiscalService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteModalidadeFechamentoFiscal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteModalidadeFechamentoFiscalService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Modalidade de fechamento fiscal excluída com sucesso" });
};

// ========== ADIANTAMENTO FOLHA ==========
export const listAdiantamentoFolha = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListAdiantamentoFolhaService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createAdiantamentoFolha = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateAdiantamentoFolhaService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateAdiantamentoFolha = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateAdiantamentoFolhaService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteAdiantamentoFolha = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteAdiantamentoFolhaService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Adiantamento da folha excluído com sucesso" });
};

// ========== CONTROLES ==========
export const listControles = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListControlesService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createControles = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateControlesService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateControles = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateControlesService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteControles = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteControlesService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Controle excluído com sucesso" });
};

// ========== TIPO CLIENTE ==========
export const listTipoCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListTipoClienteService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createTipoCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateTipoClienteService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateTipoCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateTipoClienteService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteTipoCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteTipoClienteService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Tipo de cliente excluído com sucesso" });
};

// ========== CATEGORIA CLIENTE ==========
export const listCategoriaCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListCategoriaClienteService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createCategoriaCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateCategoriaClienteService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateCategoriaCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateCategoriaClienteService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteCategoriaCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteCategoriaClienteService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Categoria de cliente excluída com sucesso" });
};

// ========== PERIODICIDADE CLIENTE ==========
export const listPeriodicidadeCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListPeriodicidadeClienteService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createPeriodicidadeCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreatePeriodicidadeClienteService({ nome, companyId });
  return res.status(201).json(item);
};

export const updatePeriodicidadeCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdatePeriodicidadeClienteService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deletePeriodicidadeCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeletePeriodicidadeClienteService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Periodicidade do cliente excluída com sucesso" });
};

// ========== REGIME TRIBUTARIO MUNICIPAL ==========
export const listRegimeTributarioMunicipal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListRegimeTributarioMunicipalService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createRegimeTributarioMunicipal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateRegimeTributarioMunicipalService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateRegimeTributarioMunicipal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateRegimeTributarioMunicipalService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteRegimeTributarioMunicipal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteRegimeTributarioMunicipalService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Regime tributário municipal excluído com sucesso" });
};

// ========== MODALIDADE FECHAMENTO DP ==========
export const listModalidadeFechamentoDP = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListModalidadeFechamentoDPService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createModalidadeFechamentoDP = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateModalidadeFechamentoDPService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateModalidadeFechamentoDP = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateModalidadeFechamentoDPService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteModalidadeFechamentoDP = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteModalidadeFechamentoDPService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Modalidade de fechamento DP excluída com sucesso" });
};

// ========== ENVIO CORRESPONDENCIA ==========
export const listEnvioCorrespondencia = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListEnvioCorrespondenciaService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createEnvioCorrespondencia = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateEnvioCorrespondenciaService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateEnvioCorrespondencia = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateEnvioCorrespondenciaService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteEnvioCorrespondencia = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteEnvioCorrespondenciaService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Envio de correspondência excluído com sucesso" });
};

// ========== PARCELAMENTOS ==========
export const listParcelamentos = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam, page, limit, status } = req.query as any;
  const result = await ListParcelamentosService({ 
    companyId, 
    searchParam,
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined,
    status
  });
  return res.status(200).json(result);
};

export const showParcelamentos = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const item = await ShowParcelamentosService({ id: parseInt(id), companyId });
  return res.status(200).json(item);
};

export const createParcelamentos = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const data = req.body;
  const item = await CreateParcelamentosService({ ...data, companyId });
  return res.status(201).json(item);
};

export const updateParcelamentos = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const data = req.body;
  const item = await UpdateParcelamentosService({ ...data, id: parseInt(id), companyId });
  return res.status(200).json(item);
};

export const deleteParcelamentos = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteParcelamentosService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Parcelamento excluído com sucesso" });
};

// ========== TAGS ==========
export const listTags = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListTagsService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createTags = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome, cor } = req.body;
  const item = await CreateTagsService({ nome, cor, companyId });
  return res.status(201).json(item);
};

export const updateTags = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome, cor } = req.body;
  const item = await UpdateTagsService({ id: parseInt(id), nome, cor, companyId });
  return res.status(200).json(item);
};

export const deleteTags = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteTagsService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Tag excluída com sucesso" });
};

// ========== STATUS CLIENTE ==========
export const listStatusCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListStatusClienteService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createStatusCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateStatusClienteService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateStatusCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateStatusClienteService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteStatusCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteStatusClienteService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Status do cliente excluído com sucesso" });
};

// ========== PORTE FEDERAL ==========
export const listPorteFederal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListPorteFederalService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createPorteFederal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreatePorteFederalService({ nome, companyId });
  return res.status(201).json(item);
};

export const updatePorteFederal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdatePorteFederalService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deletePorteFederal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeletePorteFederalService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Porte federal excluído com sucesso" });
};

// ========== PORTE ESTADUAL ==========
export const listPorteEstadual = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListPorteEstadualService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createPorteEstadual = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreatePorteEstadualService({ nome, companyId });
  return res.status(201).json(item);
};

export const updatePorteEstadual = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdatePorteEstadualService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deletePorteEstadual = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeletePorteEstadualService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Porte estadual excluído com sucesso" });
};

// ========== PORTE MUNICIPAL ==========
export const listPorteMunicipal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListPorteMunicipalService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createPorteMunicipal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreatePorteMunicipalService({ nome, companyId });
  return res.status(201).json(item);
};

export const updatePorteMunicipal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdatePorteMunicipalService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deletePorteMunicipal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeletePorteMunicipalService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Porte municipal excluído com sucesso" });
};

// ========== TIER CLIENTE ==========
export const listTierCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListTierClienteService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createTierCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateTierClienteService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateTierCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateTierClienteService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteTierCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteTierClienteService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Tier do cliente excluído com sucesso" });
};

// ========== CLUSTER CLIENTE ==========
export const listClusterCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListClusterClienteService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createClusterCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateClusterClienteService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateClusterCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateClusterClienteService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteClusterCliente = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteClusterClienteService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Cluster do cliente excluído com sucesso" });
};

// ========== VOLUME FISCAL ==========
export const listVolumeFiscal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListVolumeFiscalService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createVolumeFiscal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateVolumeFiscalService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateVolumeFiscal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateVolumeFiscalService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteVolumeFiscal = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteVolumeFiscalService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Volume fiscal excluído com sucesso" });
};

// ========== VOLUME CONTABIL ==========
export const listVolumeContabil = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListVolumeContabilService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createVolumeContabil = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateVolumeContabilService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateVolumeContabil = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateVolumeContabilService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteVolumeContabil = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteVolumeContabilService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Volume contábil excluído com sucesso" });
};

// ========== VOLUME DP ==========
export const listVolumeDP = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListVolumeDPService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createVolumeDP = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateVolumeDPService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateVolumeDP = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateVolumeDPService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteVolumeDP = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteVolumeDPService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Volume DP excluído com sucesso" });
};

// ========== VOLUME BPO ==========
export const listVolumeBPO = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListVolumeBPOService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createVolumeBPO = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateVolumeBPOService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateVolumeBPO = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateVolumeBPOService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteVolumeBPO = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteVolumeBPOService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Volume BPO excluído com sucesso" });
};

// ========== MODAL FECH BPO ==========
export const listModalFechBPO = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListModalFechBPOService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createModalFechBPO = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateModalFechBPOService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateModalFechBPO = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateModalFechBPOService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteModalFechBPO = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteModalFechBPOService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Modal fech BPO excluído com sucesso" });
};

// ========== STATUS CONTROLE ==========
export const listStatusControle = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListStatusControleService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createStatusControle = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome, cor } = req.body;
  const item = await CreateStatusControleService({ nome, cor, companyId });
  return res.status(201).json(item);
};

export const updateStatusControle = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome, cor } = req.body;
  const item = await UpdateStatusControleService({ id: parseInt(id), nome, cor, companyId });
  return res.status(200).json(item);
};

export const deleteStatusControle = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteStatusControleService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Status do controle excluído com sucesso" });
};

// ========== CONTROLE COM DATA ==========
export const listControleComData = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListControleComDataService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createControleComData = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome, cor } = req.body;
  const item = await CreateControleComDataService({ nome, cor, companyId });
  return res.status(201).json(item);
};

export const updateControleComData = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome, cor } = req.body;
  const item = await UpdateControleComDataService({ id: parseInt(id), nome, cor, companyId });
  return res.status(200).json(item);
};

export const deleteControleComData = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteControleComDataService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Controle com data excluído com sucesso" });
};

// ========== ESFERA ==========
export const listEsfera = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const items = await ListEsferaService({ companyId, searchParam });
  return res.status(200).json(items);
};

export const createEsfera = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome } = req.body;
  const item = await CreateEsferaService({ nome, companyId });
  return res.status(201).json(item);
};

export const updateEsfera = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome } = req.body;
  const item = await UpdateEsferaService({ id: parseInt(id), nome, companyId });
  return res.status(200).json(item);
};

export const deleteEsfera = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  await DeleteEsferaService({ id: parseInt(id), companyId });
  return res.status(200).json({ message: "Esfera excluída com sucesso" });
};

export const listTipoConta = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };
  const where: any = { companyId };
  if (searchParam) where.nome = { [Op.iLike]: `%${searchParam}%` };
  const items = await TipoConta.findAll({ where, order: [["nome", "ASC"]] });
  return res.status(200).json(items);
};

export const createTipoConta = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nome, ativo } = req.body;
  const item = await TipoConta.create({ nome, ativo: ativo !== undefined ? ativo : true, companyId } as any);
  return res.status(201).json(item);
};

export const updateTipoConta = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const item = await TipoConta.findOne({ where: { id, companyId } });
  if (!item) return res.status(404).json({ message: "Tipo de conta não encontrado" });
  await item.update(req.body);
  return res.status(200).json(item);
};

export const deleteTipoConta = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const item = await TipoConta.findOne({ where: { id, companyId } });
  if (!item) return res.status(404).json({ message: "Tipo de conta não encontrado" });
  await item.destroy();
  return res.status(200).json({ message: "Tipo de conta excluído com sucesso" });
};
