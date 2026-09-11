import { Request, Response } from "express";
import multer from "multer";
import crypto from "crypto";
import __cjs_sequelize from "sequelize";
import NfeXml from "../models/NfeXml";
import NfeXmlItem from "../models/NfeXmlItem";
import Cliente from "../models/Cliente";
import AppError from "../errors/AppError";
import {
  parseNfeXml,
  parseNfeEventoCancelamento
} from "../services/NfeXmlParserService";
import {
  uploadBufferToSpaces,
  buildSpacesKey,
  downloadFromSpaces,
  cdnUrlToKey
} from "../helpers/uploadToSpaces";

const { Op } = __cjs_sequelize;

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB por arquivo (XML de NF-e é sempre pequeno)
  }
});

const onlyDigits = (value: string | null | undefined): string =>
  (value ?? "").replace(/\D/g, "");

const resolveTipoOperacao = (
  clienteCnpj: string | null,
  emitCnpj: string | null,
  destCnpjCpf: string | null
): "entrada" | "saida" | "indeterminado" => {
  if (!clienteCnpj) return "indeterminado";
  if (emitCnpj && onlyDigits(clienteCnpj) === emitCnpj) return "saida";
  if (destCnpjCpf && onlyDigits(clienteCnpj) === destCnpjCpf) return "entrada";
  return "indeterminado";
};

const matchCliente = async (
  companyId: number,
  emitCnpj: string | null,
  destCnpjCpf: string | null
): Promise<Cliente | null> => {
  const candidates = [emitCnpj, destCnpjCpf].filter(Boolean) as string[];
  if (candidates.length === 0) return null;

  // Cliente.cnpj pode estar salvo com ou sem pontuação/histórico divergente,
  // então a comparação é feita normalizando os dois lados em memória.
  const clientes = await Cliente.findAll({
    where: { companyId, cnpj: { [Op.ne]: null } },
    attributes: ["id", "cnpj", "razaoSocial", "nomeFantasia"]
  });

  return (
    clientes.find(cliente => candidates.includes(onlyDigits(cliente.cnpj))) ?? null
  );
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const {
    clienteId,
    tipoOperacao,
    situacao,
    dataInicio,
    dataFim,
    search,
    page = "1",
    limit = "50"
  } = req.query as Record<string, string>;

  const whereCondition: any = { companyId };

  if (clienteId === "null") {
    whereCondition.clienteId = null;
  } else if (clienteId) {
    whereCondition.clienteId = clienteId;
  }

  if (tipoOperacao) whereCondition.tipoOperacao = tipoOperacao;
  if (situacao) whereCondition.situacao = situacao;

  if (dataInicio || dataFim) {
    whereCondition.dataEmissao = {};
    if (dataInicio) whereCondition.dataEmissao[Op.gte] = new Date(dataInicio);
    if (dataFim) whereCondition.dataEmissao[Op.lte] = new Date(dataFim);
  }

  if (search) {
    whereCondition[Op.or] = [
      { numeroNF: { [Op.like]: `%${search}%` } },
      { chaveAcesso: { [Op.like]: `%${search}%` } },
      { emitRazaoSocial: { [Op.iLike]: `%${search}%` } },
      { destRazaoSocial: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const offset = (Number(page) - 1) * Number(limit);

  const { count, rows: nfeXmls } = await NfeXml.findAndCountAll({
    where: whereCondition,
    include: [
      { model: Cliente, as: "cliente", attributes: ["id", "razaoSocial", "nomeFantasia", "cnpj"] }
    ],
    order: [["dataEmissao", "DESC"]],
    limit: Number(limit),
    offset
  });

  return res.json({
    nfeXmls,
    total: count,
    page: Number(page),
    totalPages: Math.ceil(count / Number(limit))
  });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const nfeXml = await NfeXml.findOne({
    where: { id, companyId },
    include: [
      { model: Cliente, as: "cliente", attributes: ["id", "razaoSocial", "nomeFantasia", "cnpj"] },
      { model: NfeXmlItem, as: "itens" }
    ]
  });

  if (!nfeXml) {
    throw new AppError("XML de NF-e não encontrado", 404);
  }

  return res.json(nfeXml);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new AppError("Nenhum arquivo enviado", 400);
  }

  const imported: NfeXml[] = [];
  const duplicates: { fileName: string; chaveAcesso: string; existingId: number }[] = [];
  const cancelamentos: { fileName: string; chaveAcesso: string; nfeXmlId?: number }[] = [];
  const errors: { fileName: string; message: string }[] = [];
  const chavesNesteLote = new Set<string>();

  for (const file of files) {
    const rawXml = file.buffer.toString("utf-8");

    try {
      const evento = parseNfeEventoCancelamento(rawXml);
      if (evento) {
        const existing = await NfeXml.findOne({
          where: { companyId, chaveAcesso: evento.chaveAcesso }
        });

        if (!existing) {
          errors.push({
            fileName: file.originalname,
            message: `Evento de cancelamento para a chave ${evento.chaveAcesso}, mas a NF-e correspondente ainda não foi importada`
          });
          continue;
        }

        await existing.update({
          situacao: "cancelada",
          protocoloCancelamento: evento.protocolo,
          dataCancelamento: evento.dataEvento,
          motivoCancelamento: evento.motivo
        });

        cancelamentos.push({
          fileName: file.originalname,
          chaveAcesso: evento.chaveAcesso,
          nfeXmlId: existing.id
        });
        continue;
      }

      const parsed = parseNfeXml(rawXml);

      if (chavesNesteLote.has(parsed.chaveAcesso)) {
        duplicates.push({
          fileName: file.originalname,
          chaveAcesso: parsed.chaveAcesso,
          existingId: 0
        });
        continue;
      }

      const existing = await NfeXml.findOne({
        where: { companyId, chaveAcesso: parsed.chaveAcesso }
      });

      if (existing) {
        duplicates.push({
          fileName: file.originalname,
          chaveAcesso: parsed.chaveAcesso,
          existingId: existing.id
        });
        continue;
      }

      chavesNesteLote.add(parsed.chaveAcesso);

      const cliente = await matchCliente(companyId, parsed.emitCnpj, parsed.destCnpjCpf);
      const tipoOperacao = resolveTipoOperacao(
        cliente?.cnpj ?? null,
        parsed.emitCnpj,
        parsed.destCnpjCpf
      );

      const key = buildSpacesKey(companyId, `${parsed.chaveAcesso}.xml`, "nfe-xml");
      const xmlOriginalUrl = await uploadBufferToSpaces(file.buffer, key, "application/xml");
      const xmlOriginalHash = crypto.createHash("sha256").update(file.buffer).digest("hex");

      const nfeXml = await NfeXml.create({
        companyId,
        clienteId: cliente?.id ?? null,
        uploadedBy: userId,
        chaveAcesso: parsed.chaveAcesso,
        tipoOperacao,
        situacao: "autorizada",
        numeroNF: parsed.numeroNF,
        serie: parsed.serie,
        modelo: parsed.modelo,
        naturezaOperacao: parsed.naturezaOperacao,
        dataEmissao: parsed.dataEmissao,
        dataSaidaEntrada: parsed.dataSaidaEntrada,
        emitCnpj: parsed.emitCnpj,
        emitRazaoSocial: parsed.emitRazaoSocial,
        emitNomeFantasia: parsed.emitNomeFantasia,
        emitInscricaoEstadual: parsed.emitInscricaoEstadual,
        emitEndereco: parsed.emitEndereco,
        destCnpjCpf: parsed.destCnpjCpf,
        destRazaoSocial: parsed.destRazaoSocial,
        destInscricaoEstadual: parsed.destInscricaoEstadual,
        destEndereco: parsed.destEndereco,
        valorTotalProdutos: parsed.valorTotalProdutos,
        valorTotalNota: parsed.valorTotalNota,
        valorTotalDesconto: parsed.valorTotalDesconto,
        valorTotalFrete: parsed.valorTotalFrete,
        valorTotalSeguro: parsed.valorTotalSeguro,
        valorTotalOutrasDespesas: parsed.valorTotalOutrasDespesas,
        valorBaseCalculoICMS: parsed.valorBaseCalculoICMS,
        valorICMS: parsed.valorICMS,
        valorICMSDesonerado: parsed.valorICMSDesonerado,
        valorTotalIPI: parsed.valorTotalIPI,
        valorTotalPIS: parsed.valorTotalPIS,
        valorTotalCOFINS: parsed.valorTotalCOFINS,
        protocoloAutorizacao: parsed.protocoloAutorizacao,
        dataAutorizacao: parsed.dataAutorizacao,
        xmlOriginalUrl,
        xmlOriginalNome: file.originalname,
        xmlOriginalHash,
        rawParseWarnings: parsed.warnings
      } as any);

      if (parsed.itens.length > 0) {
        await NfeXmlItem.bulkCreate(
          parsed.itens.map(item => ({
            ...item,
            nfeXmlId: nfeXml.id,
            companyId
          })) as any
        );
      }

      imported.push(nfeXml);
    } catch (error: any) {
      errors.push({
        fileName: file.originalname,
        message: error instanceof AppError ? error.message : "Erro ao processar o arquivo"
      });
    }
  }

  const statusCode = imported.length > 0 || cancelamentos.length > 0 ? 201 : 200;

  return res.status(statusCode).json({ imported, duplicates, cancelamentos, errors });
};

export const updateCliente = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;
  const { clienteId } = req.body;

  const nfeXml = await NfeXml.findOne({ where: { id, companyId } });
  if (!nfeXml) {
    throw new AppError("XML de NF-e não encontrado", 404);
  }

  let cliente: Cliente | null = null;
  if (clienteId) {
    cliente = await Cliente.findOne({ where: { id: clienteId, companyId } });
    if (!cliente) {
      throw new AppError("Cliente não encontrado", 404);
    }
  }

  const tipoOperacao = resolveTipoOperacao(
    cliente?.cnpj ?? null,
    nfeXml.emitCnpj,
    nfeXml.destCnpjCpf
  );

  await nfeXml.update({ clienteId: cliente?.id ?? null, tipoOperacao });

  return res.json(nfeXml);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const nfeXml = await NfeXml.findOne({ where: { id, companyId } });
  if (!nfeXml) {
    throw new AppError("XML de NF-e não encontrado", 404);
  }

  await nfeXml.destroy();

  return res.json({ message: "XML de NF-e removido com sucesso" });
};

export const downloadXml = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const nfeXml = await NfeXml.findOne({ where: { id, companyId } });
  if (!nfeXml || !nfeXml.xmlOriginalUrl) {
    throw new AppError("XML de NF-e não encontrado", 404);
  }

  const key = cdnUrlToKey(nfeXml.xmlOriginalUrl);
  const buffer = await downloadFromSpaces(key);

  res.setHeader("Content-Type", "application/xml");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${nfeXml.xmlOriginalNome || `${nfeXml.chaveAcesso}.xml`}"`
  );
  res.send(buffer);
};
