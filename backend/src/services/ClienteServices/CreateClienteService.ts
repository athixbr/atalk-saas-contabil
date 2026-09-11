import Cliente from "../../models/Cliente";
import AppError from "../../errors/AppError";
import GetNextCodigoSistemaService from "./GetNextCodigoSistemaService";

interface Request {
  nome: string;
  tipoCliente: "fisica" | "juridica";
  cpf?: string;
  cnpj?: string;
  razaoSocial?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  nomeFantasia?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  celular?: string;
  email?: string;
  site?: string;
  observacoes?: string;
  responsavel?: string;
  dataInicioContrato?: Date;
  valorMensalidade?: number;
  diaVencimento?: number;
  ativo: boolean;
  certidoesSelecionadas?: string[];
  companyId: number;
  // Novos campos
  tipoServico?: "interno" | "recorrente" | "esporadico";
  recorrencia?: "recorrente" | "nao_recorrente";
  codigoErp?: string;
  codigoSistema?: string;
  apelido?: string;
  honorario?: number;
  produtorRural?: boolean;
  dataAbertura?: Date;
  mesAniversario?: number;
  // Parâmetros de Enquadramento
  statusId?: number;
  statusComplementarId?: number;
  segmentoId?: number;
  atuacaoId?: number;
  atuacaoIds?: number[];
  sedeClienteId?: number;
  regimeTributarioFederalId?: number;
  regimeTributarioEstadualId?: number;
  regimeTributarioMunicipalId?: number;
  modalidadeFechamentoContabilId?: number;
  modalidadeFechamentoFiscalId?: number;
  modalidadeFechamentoDPId?: number;
  distribuicaoLucrosId?: number;
  servicosExtraordinariosId?: number;
  grupoClienteId?: number;
  localizacaoClienteId?: number;
  adiantamentoFolhaId?: number;
  controlesId?: number;
  tipoClienteId?: number;
  categoriaClienteId?: number;
  periodicidadeClienteId?: number;
  envioCorrespondenciaId?: number;
  parcelamentosId?: number;
  tagsId?: number;
  // Novos Parâmetros 2026
  statusClienteId?: number;
  porteFederalId?: number;
  porteEstadualId?: number;
  porteMunicipalId?: number;
  tierClienteId?: number;
  clusterClienteId?: number;
  volumeFiscalId?: number;
  volumeContabilId?: number;
  volumeDPId?: number;
  volumeBPOId?: number;
  modalFechBPOId?: number;
  statusControleId?: number;
}

const CreateClienteService = async ({
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
  // Parâmetros de Enquadramento
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
}: Request): Promise<Cliente> => {
  // Helper para converter string vazia ou undefined em null para campos numéricos
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

  // Helper para validar e converter datas
  const toDateOrNull = (value: any): Date | null => {
    if (!value || value === "" || value === "Invalid date" || value === "null" || value === "undefined") {
      return null;
    }
    const date = new Date(value);
    // Verificar se a data é válida (isNaN não pega datas como "0000-12-31",
    // que o JS aceita como ano 0 mas o Postgres rejeita: "date/time field
    // value out of range")
    if (isNaN(date.getTime()) || date.getFullYear() < 1000) {
      return null;
    }
    return date;
  };

  // Para pessoa jurídica, "nome" e "razaoSocial" são tratados como sinônimos
  // de exibição no restante do sistema (listagens, PDFs, cron jobs) - se o
  // cliente vier sem "nome" preenchido, usamos a razão social.
  if ((!nome || nome.trim() === "") && razaoSocial && razaoSocial.trim() !== "") {
    nome = razaoSocial;
  }

  if (tipoCliente === "fisica" && (!razaoSocial || razaoSocial.trim() === "") && nome && nome.trim() !== "") {
    razaoSocial = nome;
  }

  if (!nome || nome.trim() === "") {
    throw new AppError("Nome do cliente é obrigatório", 400);
  }

  if (!razaoSocial || razaoSocial.trim() === "") {
    throw new AppError("Razão social é obrigatória", 400);
  }

  if (!nomeFantasia || nomeFantasia.trim() === "") {
    throw new AppError("Nome fantasia é obrigatório", 400);
  }

  if (!apelido || apelido.trim() === "") {
    throw new AppError("Apelido é obrigatório", 400);
  }

  if (tipoCliente === "fisica" && !cpf) {
    throw new AppError("CPF é obrigatório para pessoa física", 400);
  }

  if (tipoCliente === "juridica" && !cnpj) {
    throw new AppError("CNPJ é obrigatório para pessoa jurídica", 400);
  }

  const codigoErpSanitizado = codigoErp?.trim() || null;
  if (codigoErpSanitizado && !/^\d{7}$/.test(codigoErpSanitizado)) {
    throw new AppError("O Código ERP deve conter exatamente 7 dígitos numéricos", 400);
  }

  // CPF pode se repetir entre clientes (ex.: produtores rurais que compartilham CPF em cadastros distintos)

  // Verificar se CNPJ já existe
  if (cnpj) {
    const clienteExistente = await Cliente.findOne({
      where: { cnpj, companyId },
    });
    if (clienteExistente) {
      throw new AppError("CNPJ já cadastrado", 400);
    }
  }

  const cliente = await Cliente.create({
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
    dataInicioContrato: toDateOrNull(dataInicioContrato),
    valorMensalidade,
    diaVencimento,
    ativo,
    certidoesSelecionadas: certidoesSelecionadas || [],
    companyId,
    // Novos campos
    tipoServico,
    recorrencia: recorrencia || "recorrente",
    codigoErp: codigoErpSanitizado,
    codigoSistema: codigoSistema || await GetNextCodigoSistemaService(companyId),
    apelido,
    honorario: toNumericOrNull(honorario),
    produtorRural,
    dataAbertura: toDateOrNull(dataAbertura),
    mesAniversario: toNumericOrNull(mesAniversario),
    // Parâmetros de Enquadramento - converter vazios para null
    statusId: toNumericOrNull(statusId),
    statusComplementarId: toNumericOrNull(statusComplementarId),
    segmentoId: toNumericOrNull(segmentoId),
    atuacaoId: toNumericOrNull(atuacaoId ?? toNumericArray(atuacaoIds)[0]),
    atuacaoIds: toNumericArray(atuacaoIds),
    sedeClienteId: toNumericOrNull(sedeClienteId),
    regimeTributarioFederalId: toNumericOrNull(regimeTributarioFederalId),
    regimeTributarioEstadualId: toNumericOrNull(regimeTributarioEstadualId),
    regimeTributarioMunicipalId: toNumericOrNull(regimeTributarioMunicipalId),
    modalidadeFechamentoContabilId: toNumericOrNull(modalidadeFechamentoContabilId),
    modalidadeFechamentoFiscalId: toNumericOrNull(modalidadeFechamentoFiscalId),
    modalidadeFechamentoDPId: toNumericOrNull(modalidadeFechamentoDPId),
    distribuicaoLucrosId: toNumericOrNull(distribuicaoLucrosId),
    servicosExtraordinariosId: toNumericOrNull(servicosExtraordinariosId),
    grupoClienteId: toNumericOrNull(grupoClienteId),
    localizacaoClienteId: toNumericOrNull(localizacaoClienteId),
    adiantamentoFolhaId: toNumericOrNull(adiantamentoFolhaId),
    controlesId: toNumericOrNull(controlesId),
    tipoClienteId: toNumericOrNull(tipoClienteId),
    categoriaClienteId: toNumericOrNull(categoriaClienteId),
    periodicidadeClienteId: toNumericOrNull(periodicidadeClienteId),
    envioCorrespondenciaId: toNumericOrNull(envioCorrespondenciaId),
    parcelamentosId: toNumericOrNull(parcelamentosId),
    tagsId: toNumericOrNull(tagsId),
    // Novos Parâmetros 2026
    statusClienteId: toNumericOrNull(statusClienteId),
    porteFederalId: toNumericOrNull(porteFederalId),
    porteEstadualId: toNumericOrNull(porteEstadualId),
    porteMunicipalId: toNumericOrNull(porteMunicipalId),
    tierClienteId: toNumericOrNull(tierClienteId),
    clusterClienteId: toNumericOrNull(clusterClienteId),
    volumeFiscalId: toNumericOrNull(volumeFiscalId),
    volumeContabilId: toNumericOrNull(volumeContabilId),
    volumeDPId: toNumericOrNull(volumeDPId),
    volumeBPOId: toNumericOrNull(volumeBPOId),
    modalFechBPOId: toNumericOrNull(modalFechBPOId),
    statusControleId: toNumericOrNull(statusControleId),
  });

  if (cliente.codigoSistema !== String(cliente.id)) {
    await cliente.update({ codigoSistema: String(cliente.id) });
  }

  return cliente;
};

export default CreateClienteService;
