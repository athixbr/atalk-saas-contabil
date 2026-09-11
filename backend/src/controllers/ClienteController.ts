import { Request, Response } from "express";
import ListClientesService from "../services/ClienteServices/ListClientesService";
import ShowClienteService from "../services/ClienteServices/ShowClienteService";
import CreateClienteService from "../services/ClienteServices/CreateClienteService";
import UpdateClienteService from "../services/ClienteServices/UpdateClienteService";
import DeleteClienteService from "../services/ClienteServices/DeleteClienteService";
import GetNextCodigoSistemaService from "../services/ClienteServices/GetNextCodigoSistemaService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { includeCertidoes } = req.query;
  const { searchParam, tipoCliente, recorrencia, ativo, estado, page = "1", limit = "10" } = req.query as any;

  const { clientes, count, hasMore } = await ListClientesService({
    companyId,
    searchParam,
    tipoCliente,
    recorrencia,
    ativo: ativo !== undefined ? ativo === "true" : undefined,
    estado,
    page: parseInt(page),
    limit: parseInt(limit),
  });

  // Se não solicitado explicitamente, remove certidoesSelecionadas da resposta
  if (!includeCertidoes) {
    clientes.forEach((cliente: any) => {
      delete cliente.dataValues?.certidoesSelecionadas;
      delete cliente.certidoesSelecionadas;
    });
  }

  return res.json({ clientes, count, hasMore });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { clienteId } = req.params;

  const cliente = await ShowClienteService({
    id: parseInt(clienteId),
    companyId,
  });

  return res.json(cliente);
};

export const nextCodigoSistema = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const codigoSistema = await GetNextCodigoSistemaService(companyId);

  return res.json({ codigoSistema });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const {
    nome,
    tipoCliente,
    cpf,
    cnpj,
    razaoSocial,
    inscricaoEstadual,
    inscricaoMunicipal,
    nomeFantasia,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    telefone,
    celular,
    email,
    site,
    observacoes,
    responsavel,
    dataInicioContrato,
    valorMensalidade,
    diaVencimento,
    ativo,
    certidoesSelecionadas,
    // Novos campos
    tipoServico,
    recorrencia,
    codigoErp,
    codigoSistema,
    apelido,
    honorario,
    produtorRural,
    dataAbertura,
    mesAniversario,
    // Parâmetros
    statusId,
    statusComplementarId,
    segmentoId,
    atuacaoId,
    atuacaoIds,
    sedeClienteId,
    regimeTributarioFederalId,
    regimeTributarioEstadualId,
    regimeTributarioMunicipalId,
    modalidadeFechamentoContabilId,
    modalidadeFechamentoFiscalId,
    modalidadeFechamentoDPId,
    distribuicaoLucrosId,
    servicosExtraordinariosId,
    grupoClienteId,
    localizacaoClienteId,
    adiantamentoFolhaId,
    controlesId,
    tipoClienteId,
    categoriaClienteId,
    periodicidadeClienteId,
    envioCorrespondenciaId,
    parcelamentosId,
    tagsId,
    // Novos Parâmetros 2026
    statusClienteId,
    porteFederalId,
    porteEstadualId,
    porteMunicipalId,
    tierClienteId,
    clusterClienteId,
    volumeFiscalId,
    volumeContabilId,
    volumeDPId,
    volumeBPOId,
    modalFechBPOId,
    statusControleId,
  } = req.body;

  const cliente = await CreateClienteService({
    nome,
    tipoCliente,
    cpf,
    cnpj,
    razaoSocial,
    inscricaoEstadual,
    inscricaoMunicipal,
    nomeFantasia,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    telefone,
    celular,
    email,
    site,
    observacoes,
    responsavel,
    dataInicioContrato,
    valorMensalidade,
    diaVencimento,
    ativo,
    certidoesSelecionadas,
    companyId,
    // Novos campos
    tipoServico,
    recorrencia,
    codigoErp,
    codigoSistema,
    apelido,
    honorario,
    produtorRural,
    dataAbertura,
    mesAniversario,
    // Parâmetros
    statusId,
    statusComplementarId,
    segmentoId,
    atuacaoId,
    atuacaoIds,
    sedeClienteId,
    regimeTributarioFederalId,
    regimeTributarioEstadualId,
    regimeTributarioMunicipalId,
    modalidadeFechamentoContabilId,
    modalidadeFechamentoFiscalId,
    modalidadeFechamentoDPId,
    distribuicaoLucrosId,
    servicosExtraordinariosId,
    grupoClienteId,
    localizacaoClienteId,
    adiantamentoFolhaId,
    controlesId,
    tipoClienteId,
    categoriaClienteId,
    periodicidadeClienteId,
    envioCorrespondenciaId,
    parcelamentosId,
    tagsId,
    // Novos Parâmetros 2026
    statusClienteId,
    porteFederalId,
    porteEstadualId,
    porteMunicipalId,
    tierClienteId,
    clusterClienteId,
    volumeFiscalId,
    volumeContabilId,
    volumeDPId,
    volumeBPOId,
    modalFechBPOId,
    statusControleId,
  });

  return res.status(201).json(cliente);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { clienteId } = req.params;
  const {
    nome,
    tipoCliente,
    cpf,
    cnpj,
    razaoSocial,
    inscricaoEstadual,
    inscricaoMunicipal,
    nomeFantasia,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    telefone,
    celular,
    email,
    site,
    observacoes,
    responsavel,
    dataInicioContrato,
    valorMensalidade,
    diaVencimento,
    ativo,
    certidoesSelecionadas,
    // Novos campos
    tipoServico,
    recorrencia,
    codigoErp,
    codigoSistema,
    apelido,
    honorario,
    produtorRural,
    dataAbertura,
    mesAniversario,
    // Parâmetros
    statusId,
    statusComplementarId,
    segmentoId,
    atuacaoId,
    atuacaoIds,
    sedeClienteId,
    regimeTributarioFederalId,
    regimeTributarioEstadualId,
    regimeTributarioMunicipalId,
    modalidadeFechamentoContabilId,
    modalidadeFechamentoFiscalId,
    modalidadeFechamentoDPId,
    distribuicaoLucrosId,
    servicosExtraordinariosId,
    grupoClienteId,
    localizacaoClienteId,
    adiantamentoFolhaId,
    controlesId,
    tipoClienteId,
    categoriaClienteId,
    periodicidadeClienteId,
    envioCorrespondenciaId,
    parcelamentosId,
    tagsId,
    // Novos Parâmetros 2026
    statusClienteId,
    porteFederalId,
    porteEstadualId,
    porteMunicipalId,
    tierClienteId,
    clusterClienteId,
    volumeFiscalId,
    volumeContabilId,
    volumeDPId,
    volumeBPOId,
    modalFechBPOId,
    statusControleId,
  } = req.body;

  const cliente = await UpdateClienteService({
    clienteId: parseInt(clienteId),
    nome,
    tipoCliente,
    cpf,
    cnpj,
    razaoSocial,
    inscricaoEstadual,
    inscricaoMunicipal,
    nomeFantasia,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    telefone,
    celular,
    email,
    site,
    observacoes,
    responsavel,
    dataInicioContrato,
    valorMensalidade,
    diaVencimento,
    ativo,
    certidoesSelecionadas,
    companyId,
    // Novos campos
    tipoServico,
    recorrencia,
    codigoErp,
    codigoSistema,
    apelido,
    honorario,
    produtorRural,
    dataAbertura,
    mesAniversario,
    // Parâmetros
    statusId,
    statusComplementarId,
    segmentoId,
    atuacaoId,
    atuacaoIds,
    sedeClienteId,
    regimeTributarioFederalId,
    regimeTributarioEstadualId,
    regimeTributarioMunicipalId,
    modalidadeFechamentoContabilId,
    modalidadeFechamentoFiscalId,
    modalidadeFechamentoDPId,
    distribuicaoLucrosId,
    servicosExtraordinariosId,
    grupoClienteId,
    localizacaoClienteId,
    adiantamentoFolhaId,
    controlesId,
    tipoClienteId,
    categoriaClienteId,
    periodicidadeClienteId,
    envioCorrespondenciaId,
    parcelamentosId,
    tagsId,
    // Novos Parâmetros 2026
    statusClienteId,
    porteFederalId,
    porteEstadualId,
    porteMunicipalId,
    tierClienteId,
    clusterClienteId,
    volumeFiscalId,
    volumeContabilId,
    volumeDPId,
    volumeBPOId,
    modalFechBPOId,
    statusControleId,
  });

  return res.json(cliente);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { clienteId } = req.params;

  await DeleteClienteService({
    clienteId: parseInt(clienteId),
    companyId,
  });

  return res.status(204).send();
};

export const updateCertidoes = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { clienteId } = req.params;
  const { certidoesSelecionadas } = req.body;

  const cliente = await UpdateClienteService({
    clienteId: parseInt(clienteId),
    certidoesSelecionadas,
    companyId,
  });

  return res.json(cliente);
};
