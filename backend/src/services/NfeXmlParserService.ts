import { XMLParser, XMLValidator } from "fast-xml-parser";
import AppError from "../errors/AppError";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseTagValue: false,
  trimValues: true
});

const onlyDigits = (value: unknown): string =>
  typeof value === "string" ? value.replace(/\D/g, "") : "";

const toDecimal = (value: unknown): number | null => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = parseFloat(String(value));
  return Number.isNaN(parsed) ? null : parsed;
};

const toDate = (value: unknown): Date | null => {
  if (typeof value !== "string" || !value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const asArray = <T>(value: T | T[] | undefined): T[] => {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
};

export interface ParsedNfeItem {
  numeroItem: number | null;
  codigoProduto: string | null;
  descricao: string | null;
  ncm: string | null;
  cfop: string | null;
  unidadeComercial: string | null;
  quantidadeComercial: number | null;
  valorUnitarioComercial: number | null;
  valorTotalProduto: number | null;
  cst: string | null;
  csosn: string | null;
  valorBaseCalculoICMS: number | null;
  aliquotaICMS: number | null;
  valorICMS: number | null;
  cstIPI: string | null;
  aliquotaIPI: number | null;
  valorIPI: number | null;
  cstPIS: string | null;
  aliquotaPIS: number | null;
  valorPIS: number | null;
  cstCOFINS: string | null;
  aliquotaCOFINS: number | null;
  valorCOFINS: number | null;
  impostosRaw: unknown;
}

export interface ParsedNfe {
  chaveAcesso: string;
  numeroNF: string | null;
  serie: string | null;
  modelo: string | null;
  naturezaOperacao: string | null;
  dataEmissao: Date | null;
  dataSaidaEntrada: Date | null;
  emitCnpj: string | null;
  emitRazaoSocial: string | null;
  emitNomeFantasia: string | null;
  emitInscricaoEstadual: string | null;
  emitEndereco: object | null;
  destCnpjCpf: string | null;
  destRazaoSocial: string | null;
  destInscricaoEstadual: string | null;
  destEndereco: object | null;
  valorTotalProdutos: number | null;
  valorTotalNota: number | null;
  valorTotalDesconto: number | null;
  valorTotalFrete: number | null;
  valorTotalSeguro: number | null;
  valorTotalOutrasDespesas: number | null;
  valorBaseCalculoICMS: number | null;
  valorICMS: number | null;
  valorICMSDesonerado: number | null;
  valorTotalIPI: number | null;
  valorTotalPIS: number | null;
  valorTotalCOFINS: number | null;
  protocoloAutorizacao: string | null;
  dataAutorizacao: Date | null;
  itens: ParsedNfeItem[];
  warnings: string[];
}

export interface ParsedNfeCancelamento {
  chaveAcesso: string;
  protocolo: string | null;
  dataEvento: Date | null;
  motivo: string | null;
}

const extractEndereco = (ender: any): object | null => {
  if (!ender) return null;
  return {
    logradouro: ender.xLgr ?? null,
    numero: ender.nro ?? null,
    complemento: ender.xCpl ?? null,
    bairro: ender.xBairro ?? null,
    codigoMunicipio: ender.cMun ?? null,
    municipio: ender.xMun ?? null,
    uf: ender.UF ?? null,
    cep: ender.CEP ?? null,
    codigoPais: ender.cPais ?? null,
    pais: ender.xPais ?? null,
    fone: ender.fone ?? null
  };
};

const extractItens = (det: any): ParsedNfeItem[] => {
  return asArray(det).map((item: any) => {
    const prod = item?.prod ?? {};
    const imposto = item?.imposto ?? {};
    const icms = imposto?.ICMS ? Object.values(imposto.ICMS)[0] : undefined;
    const ipiTrib = imposto?.IPI?.IPITrib;
    const pis = imposto?.PIS ? Object.values(imposto.PIS)[0] : undefined;
    const cofins = imposto?.COFINS ? Object.values(imposto.COFINS)[0] : undefined;

    return {
      numeroItem: item?.["@_nItem"] ? Number(item["@_nItem"]) : null,
      codigoProduto: prod.cProd ?? null,
      descricao: prod.xProd ?? null,
      ncm: prod.NCM ?? null,
      cfop: prod.CFOP ?? null,
      unidadeComercial: prod.uCom ?? null,
      quantidadeComercial: toDecimal(prod.qCom),
      valorUnitarioComercial: toDecimal(prod.vUnCom),
      valorTotalProduto: toDecimal(prod.vProd),
      cst: (icms as any)?.CST ?? null,
      csosn: (icms as any)?.CSOSN ?? null,
      valorBaseCalculoICMS: toDecimal((icms as any)?.vBC),
      aliquotaICMS: toDecimal((icms as any)?.pICMS),
      valorICMS: toDecimal((icms as any)?.vICMS),
      cstIPI: ipiTrib?.CST ?? null,
      aliquotaIPI: toDecimal(ipiTrib?.pIPI),
      valorIPI: toDecimal(ipiTrib?.vIPI),
      cstPIS: (pis as any)?.CST ?? null,
      aliquotaPIS: toDecimal((pis as any)?.pPIS),
      valorPIS: toDecimal((pis as any)?.vPIS),
      cstCOFINS: (cofins as any)?.CST ?? null,
      aliquotaCOFINS: toDecimal((cofins as any)?.pCOFINS),
      valorCOFINS: toDecimal((cofins as any)?.vCOFINS),
      impostosRaw: imposto
    };
  });
};

/**
 * Detecta a raiz do documento e devolve o objeto correspondente já "desembrulhado",
 * junto com um marcador do tipo de documento identificado.
 */
const detectRoot = (parsed: any) => {
  if (parsed.nfeProc) return { type: "nfeProc" as const, root: parsed.nfeProc };
  if (parsed.NFe) return { type: "NFe" as const, root: parsed.NFe };
  if (parsed.procEventoNFe) return { type: "evento" as const, root: parsed.procEventoNFe };
  if (parsed.evento) return { type: "evento" as const, root: parsed.evento };
  if (parsed.cteProc || parsed.CTe) {
    throw new AppError("Arquivo é um CT-e, não uma NF-e — não suportado neste módulo", 422);
  }
  return { type: "unknown" as const, root: null };
};

/**
 * Faz o parse de um evento de cancelamento de NF-e (tpEvento 110111).
 * Retorna null se o XML não for um evento de cancelamento reconhecido.
 */
export const parseNfeEventoCancelamento = (rawXml: string): ParsedNfeCancelamento | null => {
  const validation = XMLValidator.validate(rawXml);
  if (validation !== true) return null;

  const parsed = parser.parse(rawXml);
  const { type, root } = detectRoot(parsed);
  if (type !== "evento" || !root) return null;

  const infEvento = root.infEvento ?? root.evento?.infEvento;
  if (!infEvento) return null;

  const tpEvento = infEvento.tpEvento;
  if (tpEvento !== "110111") return null;

  const chaveAcesso = infEvento.chNFe;
  if (!chaveAcesso) return null;

  const protocolo =
    root.retEvento?.infEvento?.nProt ?? infEvento.nProt ?? null;

  return {
    chaveAcesso,
    protocolo,
    dataEvento: toDate(infEvento.dhEvento),
    motivo: infEvento.detEvento?.xJust ?? null
  };
};

/**
 * Faz o parse completo de um XML de NF-e (modelo 55), aceitando tanto a
 * estrutura `nfeProc` (nota + protocolo de autorização) quanto `NFe` (nota isolada).
 * Lança AppError para XML malformado, evento de cancelamento, ou documento de
 * um tipo diferente de NF-e modelo 55 (NFC-e, CT-e etc).
 */
export const parseNfeXml = (rawXml: string): ParsedNfe => {
  const validation = XMLValidator.validate(rawXml);
  if (validation !== true) {
    throw new AppError("Arquivo XML malformado", 422);
  }

  const parsed = parser.parse(rawXml);
  const { type, root } = detectRoot(parsed);

  if (type === "evento") {
    throw new AppError(
      "Arquivo é um evento de NF-e (ex.: cancelamento), não uma nota fiscal",
      422
    );
  }

  if (type === "unknown" || !root) {
    throw new AppError("Arquivo XML não reconhecido como NF-e (raiz inesperada)", 422);
  }

  const infNFe = type === "nfeProc" ? root.NFe?.infNFe : root.infNFe;
  if (!infNFe) {
    throw new AppError("Arquivo XML não reconhecido como NF-e (infNFe ausente)", 422);
  }

  const warnings: string[] = [];

  const versao = infNFe["@_versao"];
  if (versao && !String(versao).startsWith("4.")) {
    warnings.push(`Versão de layout inesperada: ${versao}`);
  }

  const { ide, emit, dest, det, total } = infNFe;

  const modelo = ide?.mod ?? null;
  if (modelo === "65") {
    throw new AppError(
      "Arquivo é uma NFC-e (modelo 65), não uma NF-e (modelo 55) — não suportado neste módulo",
      422
    );
  }
  if (modelo && modelo !== "55") {
    warnings.push(`Modelo de documento inesperado: ${modelo}`);
  }

  const chaveAcesso = onlyDigits(infNFe["@_Id"]);
  if (!chaveAcesso || chaveAcesso.length !== 44) {
    throw new AppError("Chave de acesso da NF-e não encontrada ou inválida", 422);
  }

  const icmsTot = total?.ICMSTot ?? {};

  const protNFe = type === "nfeProc" ? root.protNFe?.infProt : null;

  return {
    chaveAcesso,
    numeroNF: ide?.nNF ?? null,
    serie: ide?.serie ?? null,
    modelo,
    naturezaOperacao: ide?.natOp ?? null,
    dataEmissao: toDate(ide?.dhEmi ?? ide?.dEmi),
    dataSaidaEntrada: toDate(ide?.dhSaiEnt),
    emitCnpj: onlyDigits(emit?.CNPJ) || onlyDigits(emit?.CPF) || null,
    emitRazaoSocial: emit?.xNome ?? null,
    emitNomeFantasia: emit?.xFant ?? null,
    emitInscricaoEstadual: emit?.IE ?? null,
    emitEndereco: extractEndereco(emit?.enderEmit),
    destCnpjCpf: onlyDigits(dest?.CNPJ) || onlyDigits(dest?.CPF) || null,
    destRazaoSocial: dest?.xNome ?? null,
    destInscricaoEstadual: dest?.IE ?? null,
    destEndereco: extractEndereco(dest?.enderDest),
    valorTotalProdutos: toDecimal(icmsTot.vProd),
    valorTotalNota: toDecimal(icmsTot.vNF),
    valorTotalDesconto: toDecimal(icmsTot.vDesc),
    valorTotalFrete: toDecimal(icmsTot.vFrete),
    valorTotalSeguro: toDecimal(icmsTot.vSeg),
    valorTotalOutrasDespesas: toDecimal(icmsTot.vOutro),
    valorBaseCalculoICMS: toDecimal(icmsTot.vBC),
    valorICMS: toDecimal(icmsTot.vICMS),
    valorICMSDesonerado: toDecimal(icmsTot.vICMSDeson),
    valorTotalIPI: toDecimal(icmsTot.vIPI),
    valorTotalPIS: toDecimal(icmsTot.vPIS),
    valorTotalCOFINS: toDecimal(icmsTot.vCOFINS),
    protocoloAutorizacao: protNFe?.nProt ?? null,
    dataAutorizacao: toDate(protNFe?.dhRecbto),
    itens: extractItens(det),
    warnings
  };
};
