import Cliente from "../../models/Cliente";
import AppError from "../../errors/AppError";

interface Request {
  clienteId: number;
  nome?: string;
  tipoCliente?: "fisica" | "juridica";
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
  ativo?: boolean;
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

const UpdateClienteService = async ({
  clienteId,
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

  const cliente = await Cliente.findOne({
    where: { id: clienteId, companyId },
  });

  if (!cliente) {
    throw new AppError("Cliente não encontrado", 404);
  }

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

  // CPF pode se repetir entre clientes (ex.: produtores rurais que compartilham CPF em cadastros distintos)

  // Verificar se CNPJ já existe em outro cliente
  if (cnpj && cnpj !== cliente.cnpj) {
    const clienteExistente = await Cliente.findOne({
      where: { cnpj, companyId },
    });
    if (clienteExistente && clienteExistente.id !== clienteId) {
      throw new AppError("CNPJ já cadastrado para outro cliente", 400);
    }
  }

  const codigoErpSanitizado = codigoErp?.trim() || null;
  if (codigoErp !== undefined && codigoErpSanitizado && !/^\d{7}$/.test(codigoErpSanitizado)) {
    throw new AppError("O Código ERP deve conter exatamente 7 dígitos numéricos", 400);
  }

  await cliente.update({
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
    ...(certidoesSelecionadas !== undefined && { certidoesSelecionadas }),
    // Novos campos
    ...(tipoServico !== undefined && { tipoServico }),
    ...(recorrencia !== undefined && { recorrencia }),
    ...(codigoErp !== undefined && { codigoErp: codigoErpSanitizado }),
    ...(apelido !== undefined && { apelido }),
    ...(honorario !== undefined && { honorario: toNumericOrNull(honorario) }),
    ...(produtorRural !== undefined && { produtorRural }),
    ...(dataAbertura !== undefined && { dataAbertura: toDateOrNull(dataAbertura) }),
    ...(mesAniversario !== undefined && { mesAniversario: toNumericOrNull(mesAniversario) }),
    // Parâmetros de Enquadramento - converter vazios para null
    ...(statusId !== undefined && { statusId: toNumericOrNull(statusId) }),
    ...(statusComplementarId !== undefined && { statusComplementarId: toNumericOrNull(statusComplementarId) }),
    ...(segmentoId !== undefined && { segmentoId: toNumericOrNull(segmentoId) }),
    ...(atuacaoId !== undefined && { atuacaoId: toNumericOrNull(atuacaoId) }),
    ...(atuacaoIds !== undefined && {
      atuacaoIds: toNumericArray(atuacaoIds),
      atuacaoId: toNumericOrNull(toNumericArray(atuacaoIds)[0]),
    }),
    ...(sedeClienteId !== undefined && { sedeClienteId: toNumericOrNull(sedeClienteId) }),
    ...(regimeTributarioFederalId !== undefined && { regimeTributarioFederalId: toNumericOrNull(regimeTributarioFederalId) }),
    ...(regimeTributarioEstadualId !== undefined && { regimeTributarioEstadualId: toNumericOrNull(regimeTributarioEstadualId) }),
    ...(regimeTributarioMunicipalId !== undefined && { regimeTributarioMunicipalId: toNumericOrNull(regimeTributarioMunicipalId) }),
    ...(modalidadeFechamentoContabilId !== undefined && { modalidadeFechamentoContabilId: toNumericOrNull(modalidadeFechamentoContabilId) }),
    ...(modalidadeFechamentoFiscalId !== undefined && { modalidadeFechamentoFiscalId: toNumericOrNull(modalidadeFechamentoFiscalId) }),
    ...(modalidadeFechamentoDPId !== undefined && { modalidadeFechamentoDPId: toNumericOrNull(modalidadeFechamentoDPId) }),
    ...(distribuicaoLucrosId !== undefined && { distribuicaoLucrosId: toNumericOrNull(distribuicaoLucrosId) }),
    ...(servicosExtraordinariosId !== undefined && { servicosExtraordinariosId: toNumericOrNull(servicosExtraordinariosId) }),
    ...(grupoClienteId !== undefined && { grupoClienteId: toNumericOrNull(grupoClienteId) }),
    ...(localizacaoClienteId !== undefined && { localizacaoClienteId: toNumericOrNull(localizacaoClienteId) }),
    ...(adiantamentoFolhaId !== undefined && { adiantamentoFolhaId: toNumericOrNull(adiantamentoFolhaId) }),
    ...(controlesId !== undefined && { controlesId: toNumericOrNull(controlesId) }),
    ...(tipoClienteId !== undefined && { tipoClienteId: toNumericOrNull(tipoClienteId) }),
    ...(categoriaClienteId !== undefined && { categoriaClienteId: toNumericOrNull(categoriaClienteId) }),
    ...(periodicidadeClienteId !== undefined && { periodicidadeClienteId: toNumericOrNull(periodicidadeClienteId) }),
    ...(envioCorrespondenciaId !== undefined && { envioCorrespondenciaId: toNumericOrNull(envioCorrespondenciaId) }),
    ...(parcelamentosId !== undefined && { parcelamentosId: toNumericOrNull(parcelamentosId) }),
    ...(tagsId !== undefined && { tagsId: toNumericOrNull(tagsId) }),
    // Novos Parâmetros 2026
    ...(statusClienteId !== undefined && { statusClienteId: toNumericOrNull(statusClienteId) }),
    ...(porteFederalId !== undefined && { porteFederalId: toNumericOrNull(porteFederalId) }),
    ...(porteEstadualId !== undefined && { porteEstadualId: toNumericOrNull(porteEstadualId) }),
    ...(porteMunicipalId !== undefined && { porteMunicipalId: toNumericOrNull(porteMunicipalId) }),
    ...(tierClienteId !== undefined && { tierClienteId: toNumericOrNull(tierClienteId) }),
    ...(clusterClienteId !== undefined && { clusterClienteId: toNumericOrNull(clusterClienteId) }),
    ...(volumeFiscalId !== undefined && { volumeFiscalId: toNumericOrNull(volumeFiscalId) }),
    ...(volumeContabilId !== undefined && { volumeContabilId: toNumericOrNull(volumeContabilId) }),
    ...(volumeDPId !== undefined && { volumeDPId: toNumericOrNull(volumeDPId) }),
    ...(volumeBPOId !== undefined && { volumeBPOId: toNumericOrNull(volumeBPOId) }),
    ...(modalFechBPOId !== undefined && { modalFechBPOId: toNumericOrNull(modalFechBPOId) }),
    ...(statusControleId !== undefined && { statusControleId: toNumericOrNull(statusControleId) }),
  });

  return cliente;
};

export default UpdateClienteService;
