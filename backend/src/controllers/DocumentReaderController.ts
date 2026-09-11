import { Request, Response } from "express";
import DigitalOceanService from "../services/DigitalOceanService";
import DocumentReaderService from "../services/DocumentReaderService";
import DocumentParserService from "../services/DocumentParserService";
import TaskFile from "../models/TaskFile";
import TemplateLeitura from "../models/TemplateLeitura";
import Task from "../models/Task";
import AppError from "../errors/AppError";
import { Op } from "sequelize";

const templateAttributes = [
  "id",
  "nome",
  "tipo",
  "descricao",
  "ativo",
  "campos",
  "validacoes",
  "exemplos",
  "arquivoEspelhoNome",
  "arquivoEspelhoPath",
  "arquivoEspelhoMimeType",
  "arquivoEspelhoSize",
  "textoEspelho",
  "dadosEspelho",
  "instrucoesIa",
  "createdAt",
  "updatedAt"
];

const buildCaptureRegex = (label: string, valuePattern = "(.+)") =>
  `${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[:\\s]*${valuePattern}`;

const detectTemplateSuggestion = (text: string, originalName: string) => {
  const lower = text.toLowerCase();
  const fileTitle = originalName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");

  if (lower.includes("simples nacional") || lower.includes("das ")) {
    return {
      nome: "Guia Simples Nacional",
      tipo: "guia_simples_nacional",
      descricao: "Guia ou comprovante relacionado ao Simples Nacional"
    };
  }

  if (lower.includes("darf") || lower.includes("documento de arrecadação")) {
    return {
      nome: "DARF",
      tipo: "darf",
      descricao: "Documento de Arrecadação de Receitas Federais"
    };
  }

  if (lower.includes("fgts") || lower.includes("fundo de garantia")) {
    return {
      nome: "Guia FGTS",
      tipo: "guia_fgts",
      descricao: "Guia ou comprovante relacionado ao FGTS"
    };
  }

  if (lower.includes("comprovante") || lower.includes("pagamento efetuado")) {
    return {
      nome: "Comprovante de Pagamento",
      tipo: "comprovante_pagamento",
      descricao: "Comprovante simples de pagamento"
    };
  }

  return {
    nome: fileTitle || "Novo Modelo de Leitura",
    tipo: "modelo_leitura",
    descricao: "Modelo criado a partir de arquivo enviado"
  };
};

const suggestFieldsFromText = (text: string) => {
  const fields: any[] = [];
  const addField = (nome: string, tipo: string, regex: string, instrucao: string, obrigatorio = true) => {
    if (!fields.some(field => field.nome === nome)) {
      fields.push({ nome, tipo, regex, obrigatorio, instrucao, descricao: instrucao });
    }
  };

  if (/cnpj/i.test(text) || /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/.test(text)) {
    addField("cnpj", "cnpj", "(?:CNPJ|CNPJ/CPF)[:\\s]*([\\d./-]{14,18})", "Capturar o CNPJ do contribuinte ou empresa");
  }

  if (/cpf/i.test(text) || /\d{3}\.\d{3}\.\d{3}-\d{2}/.test(text)) {
    addField("cpf", "cpf", "CPF[:\\s]*([\\d.-]{11,14})", "Capturar o CPF quando o documento for de pessoa fisica", false);
  }

  if (/raz[aã]o social|contribuinte|empresa|nome empresarial/i.test(text)) {
    addField(
      "razao_social",
      "text",
      "(?:Raz[aã]o Social|Nome Empresarial|Contribuinte|Empresa)[:\\s]+(.+)",
      "Capturar o nome ou razao social"
    );
  }

  if (/compet[eê]ncia|per[ií]odo de apura[cç][aã]o|pa\b/i.test(text)) {
    addField(
      "competencia",
      "text",
      "(?:Compet[eê]ncia|Per[ií]odo de Apura[cç][aã]o|PA)[:\\s]*(\\d{2}\\/\\d{4}|\\d{2}\\/\\d{2}\\/\\d{4})",
      "Capturar a competencia ou periodo de apuracao"
    );
  }

  if (/vencimento|venc\./i.test(text)) {
    addField(
      "vencimento",
      "date",
      "(?:Vencimento|Data de Vencimento|Venc\\.)[:\\s]*(\\d{2}[/-]\\d{2}[/-]\\d{4})",
      "Capturar a data de vencimento"
    );
  }

  if (/valor|total|principal/i.test(text)) {
    addField(
      "valor_total",
      "currency",
      "(?:Valor Total|Total|Valor do Documento|Valor Principal|Valor)[:\\s]*R?\\$?\\s*([\\d.,]+)",
      "Capturar o valor principal ou valor total do documento"
    );
  }

  if (/c[oó]digo de barras|linha digit[aá]vel|\d{44,48}/i.test(text)) {
    addField(
      "codigo_barras",
      "barcode",
      "(?:C[oó]digo de Barras|Linha Digit[aá]vel)[:\\s]*([\\d\\s.]+)",
      "Capturar codigo de barras ou linha digitavel",
      false
    );
  }

  if (/data de pagamento|pagamento efetuado|pago em/i.test(text)) {
    addField(
      "data_pagamento",
      "date",
      "(?:Data de Pagamento|Pago em|Pagamento efetuado em)[:\\s]*(\\d{2}[/-]\\d{2}[/-]\\d{4})",
      "Capturar a data em que o pagamento foi realizado",
      false
    );
  }

  if (/c[oó]digo da receita|receita/i.test(text)) {
    addField(
      "codigo_receita",
      "text",
      "(?:C[oó]digo da Receita|Receita)[:\\s]*(\\d{4})",
      "Capturar o codigo da receita",
      false
    );
  }

  return fields.length ? fields : [
    {
      nome: "campo_principal",
      tipo: "text",
      regex: buildCaptureRegex("Campo principal"),
      obrigatorio: true,
      instrucao: "Ajuste este campo com a informacao principal que deve ser capturada",
      descricao: "Ajuste este campo com a informacao principal que deve ser capturada"
    }
  ];
};

/**
 * Upload de arquivo e leitura automática
 */
export const uploadAndReadDocument = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { taskId, templateLeituraId, autoProcess = true } = req.body;
  const { companyId, id: userId } = req.user;
  const file = req.file;

  if (!file) {
    throw new AppError("Arquivo não enviado", 400);
  }

  if (!taskId) {
    throw new AppError("ID da tarefa não informado", 400);
  }

  try {
    // 1. Verificar se tarefa existe e pertence à empresa
    const task = await Task.findOne({
      where: { id: taskId, companyId }
    });

    if (!task) {
      throw new AppError("Tarefa não encontrada", 404);
    }

    // 2. Verificar se tipo de arquivo é suportado
    if (!DocumentReaderService.isSupportedFileType(file.mimetype)) {
      throw new AppError(
        `Tipo de arquivo não suportado: ${file.mimetype}. Use PDF ou imagens (JPG, PNG)`,
        400
      );
    }

    // 3. Upload para Digital Ocean Spaces
    const uploadResult = await DigitalOceanService.upload({
      companyId,
      folder: `tasks/${taskId}`,
      file,
      isPublic: false,
      generateThumbnail: file.mimetype.startsWith("image/")
    });

    // 4. Criar registro inicial do arquivo
    const taskFile = await TaskFile.create({
      taskId,
      templateLeituraId: templateLeituraId || null,
      filename: uploadResult.path.split("/").pop(),
      originalName: file.originalname,
      path: uploadResult.path,
      size: file.size,
      mimeType: file.mimetype,
      status: autoProcess ? "processing" : "pending",
      uploadedBy: userId,
      companyId
    });

    // 5. Se autoProcess = true, processar imediatamente
    if (autoProcess) {
      try {
        // Extrair texto
        const extractionResult = await DocumentReaderService.extractText(
          file.buffer,
          file.mimetype,
          file.originalname
        );

        // Pré-processar texto
        const textoProcessado = DocumentReaderService.preprocessText(
          extractionResult.text
        );

        // Atualizar com texto extraído
        await taskFile.update({
          textoExtraido: textoProcessado
        });

        // Se tem template, fazer parsing
        let dadosExtraidos = null;
        let confianca = 0;
        let parseResult = null;

        if (templateLeituraId) {
          const template = await TemplateLeitura.findByPk(templateLeituraId);

          if (template && template.ativo) {
            parseResult = DocumentParserService.extractData(
              textoProcessado,
              template as any
            );

            dadosExtraidos = parseResult.dados;
            confianca = parseResult.confianca;

            // Atualizar arquivo com dados extraídos
            await taskFile.update({
              dadosExtraidos,
              confianca,
              status: confianca >= 0.7 ? "completed" : "review",
              dataLeitura: new Date()
            });
          }
        } else {
          // Sem template: tentar detectar automaticamente
          const detectedType = DocumentParserService.detectDocumentType(
            textoProcessado
          );

          if (detectedType) {
            // Buscar template do tipo detectado
            const template = await TemplateLeitura.findOne({
              where: {
                tipo: detectedType,
                companyId,
                ativo: true
              }
            });

            if (template) {
              parseResult = DocumentParserService.extractData(
                textoProcessado,
                template as any
              );

              dadosExtraidos = parseResult.dados;
              confianca = parseResult.confianca;

              await taskFile.update({
                templateLeituraId: template.id,
                dadosExtraidos,
                confianca,
                status: confianca >= 0.7 ? "completed" : "review",
                dataLeitura: new Date()
              });
            }
          }

          // Se não detectou ou não achou template, marcar como completado sem parsing
          if (!dadosExtraidos) {
            await taskFile.update({
              status: "completed",
              dataLeitura: new Date()
            });
          }
        }

        return res.json({
          success: true,
          file: {
            id: taskFile.id,
            originalName: file.originalname,
            path: taskFile.path,
            status: taskFile.status,
            size: file.size
          },
          extraction: {
            hasText: !!textoProcessado,
            textPreview: textoProcessado.substring(0, 500),
            dados: dadosExtraidos,
            confianca,
            needsReview: confianca < 0.9,
            camposFaltantes: parseResult?.camposFaltantes || [],
            detectedType: parseResult
              ? null
              : DocumentParserService.detectDocumentType(textoProcessado)
          }
        });
      } catch (processingError) {
        // Erro no processamento - salvar erro no registro
        await taskFile.update({
          status: "error",
          erro: processingError.message,
          dataLeitura: new Date()
        });

        return res.status(500).json({
          success: false,
          error: "Erro ao processar documento",
          details: processingError.message,
          file: {
            id: taskFile.id,
            originalName: file.originalname,
            status: "error"
          }
        });
      }
    }

    // Se não processar agora, retornar apenas o arquivo salvo
    return res.json({
      success: true,
      file: {
        id: taskFile.id,
        originalName: file.originalname,
        path: taskFile.path,
        status: taskFile.status,
        size: file.size
      }
    });
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    throw error;
  }
};

/**
 * Listar arquivos de uma tarefa
 */
export const listTaskFiles = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { taskId } = req.params;
  const { companyId } = req.user;

  const files = await TaskFile.findAll({
    where: { taskId, companyId },
    include: [
      {
        model: TemplateLeitura,
        as: "template",
        attributes: ["id", "nome", "tipo", "descricao"]
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  return res.json(files);
};

/**
 * Obter detalhes de um arquivo específico
 */
export const getTaskFile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { fileId } = req.params;
  const { companyId } = req.user;

  const file = await TaskFile.findOne({
    where: { id: fileId, companyId },
    include: [
      {
        model: TemplateLeitura,
        as: "template"
      }
    ]
  });

  if (!file) {
    throw new AppError("Arquivo não encontrado", 404);
  }

  return res.json(file);
};

/**
 * Download de arquivo (gera URL assinada)
 */
export const downloadTaskFile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { fileId } = req.params;
  const { companyId } = req.user;

  const file = await TaskFile.findOne({
    where: { id: fileId, companyId }
  });

  if (!file) {
    throw new AppError("Arquivo não encontrado", 404);
  }

  // Gerar URL assinada (expira em 1 hora)
  const signedUrl = DigitalOceanService.getSignedUrl(file.path, 3600);

  return res.json({
    url: signedUrl,
    filename: file.originalName,
    expiresIn: 3600
  });
};

/**
 * Deletar arquivo
 */
export const deleteTaskFile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { fileId } = req.params;
  const { companyId } = req.user;

  const file = await TaskFile.findOne({
    where: { id: fileId, companyId }
  });

  if (!file) {
    throw new AppError("Arquivo não encontrado", 404);
  }

  // Deletar do Digital Ocean
  await DigitalOceanService.delete(file.path);

  // Deletar do banco
  await file.destroy();

  return res.json({ success: true, message: "Arquivo deletado com sucesso" });
};

/**
 * Reprocessar arquivo (tentar extrair dados novamente)
 */
export const reprocessTaskFile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { fileId } = req.params;
  const { templateLeituraId } = req.body;
  const { companyId } = req.user;

  const file = await TaskFile.findOne({
    where: { id: fileId, companyId }
  });

  if (!file) {
    throw new AppError("Arquivo não encontrado", 404);
  }

  // Marcar como processando
  await file.update({ status: "processing" });

  try {
    // Se não tem texto extraído, fazer extração
    if (!file.textoExtraido) {
      // Baixar arquivo do Digital Ocean
      const fileBuffer = await DigitalOceanService.download(file.path);

      // Extrair texto
      const extractionResult = await DocumentReaderService.extractText(
        fileBuffer,
        file.mimeType,
        file.originalName
      );

      const textoProcessado = DocumentReaderService.preprocessText(
        extractionResult.text
      );

      await file.update({ textoExtraido: textoProcessado });
    }

    // Usar template especificado ou o que já estava no arquivo
    const templateId = templateLeituraId || file.templateLeituraId;

    if (templateId) {
      const template = await TemplateLeitura.findByPk(templateId);

      if (!template || !template.ativo) {
        throw new AppError("Template não encontrado ou inativo", 404);
      }

      const parseResult = DocumentParserService.extractData(
        file.textoExtraido,
        template as any
      );

      await file.update({
        templateLeituraId: template.id,
        dadosExtraidos: parseResult.dados,
        confianca: parseResult.confianca,
        status: parseResult.confianca >= 0.7 ? "completed" : "review",
        dataLeitura: new Date(),
        erro: null
      });

      return res.json({
        success: true,
        file: {
          id: file.id,
          status: file.status,
          confianca: file.confianca
        },
        extraction: {
          dados: parseResult.dados,
          confianca: parseResult.confianca,
          camposFaltantes: parseResult.camposFaltantes
        }
      });
    } else {
      throw new AppError("Template não especificado", 400);
    }
  } catch (error) {
    await file.update({
      status: "error",
      erro: error.message
    });

    throw error;
  }
};

/**
 * Atualizar dados extraídos manualmente
 */
export const updateExtractedData = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { fileId } = req.params;
  const { dadosExtraidos } = req.body;
  const { companyId } = req.user;

  const file = await TaskFile.findOne({
    where: { id: fileId, companyId }
  });

  if (!file) {
    throw new AppError("Arquivo não encontrado", 404);
  }

  // Atualizar dados e marcar como revisado (confiança 1.0)
  await file.update({
    dadosExtraidos,
    confianca: 1.0,
    status: "completed"
  });

  return res.json({
    success: true,
    file: {
      id: file.id,
      dadosExtraidos: file.dadosExtraidos,
      status: file.status
    }
  });
};

/**
 * Listar templates disponíveis
 */
export const listTemplates = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam, onlyActive } = req.query;

  const where: any = { companyId };

  if (onlyActive === "true") {
    where.ativo = true;
  }

  if (searchParam) {
    where[Op.or] = [
      { nome: { [Op.iLike]: `%${searchParam}%` } },
      { tipo: { [Op.iLike]: `%${searchParam}%` } },
      { descricao: { [Op.iLike]: `%${searchParam}%` } }
    ];
  }

  const templates = await TemplateLeitura.findAll({
    where,
    attributes: templateAttributes,
    order: [["nome", "ASC"]]
  });

  return res.json(templates);
};

/**
 * Criar novo template
 */
export const createTemplate = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const {
    nome,
    descricao,
    tipo,
    campos,
    validacoes,
    exemplos,
    instrucoesIa,
    arquivoEspelhoNome,
    arquivoEspelhoMimeType,
    arquivoEspelhoSize,
    textoEspelho,
    dadosEspelho,
    ativo = true
  } = req.body;

  if (!nome || !tipo || !campos || !Array.isArray(campos)) {
    throw new AppError(
      "Dados incompletos. Nome, tipo e campos são obrigatórios",
      400
    );
  }

  const template = await TemplateLeitura.create({
    nome,
    descricao,
    tipo,
    campos,
    validacoes,
    exemplos,
    instrucoesIa,
    arquivoEspelhoNome,
    arquivoEspelhoMimeType,
    arquivoEspelhoSize,
    textoEspelho,
    dadosEspelho,
    companyId,
    ativo
  });

  return res.status(201).json(template);
};

/**
 * Atualizar template
 */
export const updateTemplate = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { templateId } = req.params;
  const { companyId } = req.user;
  const {
    nome,
    descricao,
    tipo,
    campos,
    validacoes,
    exemplos,
    instrucoesIa,
    ativo
  } = req.body;

  const template = await TemplateLeitura.findOne({
    where: { id: templateId, companyId }
  });

  if (!template) {
    throw new AppError("Template não encontrado", 404);
  }

  await template.update({
    nome,
    descricao,
    tipo,
    campos,
    validacoes,
    exemplos,
    instrucoesIa,
    ativo
  });

  return res.json(template);
};

/**
 * Excluir template
 */
export const deleteTemplate = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { templateId } = req.params;
  const { companyId } = req.user;

  const template = await TemplateLeitura.findOne({
    where: { id: templateId, companyId }
  });

  if (!template) {
    throw new AppError("Template não encontrado", 404);
  }

  const inUse = await TaskFile.count({
    where: { templateLeituraId: template.id, companyId }
  });

  if (inUse > 0) {
    await template.update({ ativo: false });
    return res.json({
      success: true,
      message: "Modelo inativado porque já possui arquivos vinculados"
    });
  }

  if (template.arquivoEspelhoPath) {
    await DigitalOceanService.delete(template.arquivoEspelhoPath);
  }

  await template.destroy();

  return res.json({ success: true });
};

/**
 * Obter template específico
 */
export const getTemplate = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { templateId } = req.params;
  const { companyId } = req.user;

  const template = await TemplateLeitura.findOne({
    where: { id: templateId, companyId }
  });

  if (!template) {
    throw new AppError("Template não encontrado", 404);
  }

  return res.json(template);
};

/**
 * Analisa arquivo sem precisar criar o template antes.
 */
export const analyzeTemplateFile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const file = req.file;

  if (!file) {
    throw new AppError("Arquivo não enviado", 400);
  }

  if (!DocumentReaderService.isSupportedFileType(file.mimetype)) {
    throw new AppError(
      `Tipo de arquivo não suportado: ${file.mimetype}. Use PDF ou imagens (JPG, JPEG, PNG, TIFF ou BMP)`,
      400
    );
  }

  const extractionResult = await DocumentReaderService.extractText(
    file.buffer,
    file.mimetype,
    file.originalname
  );

  const textoEspelho = DocumentReaderService.preprocessText(extractionResult.text);
  const suggestion = detectTemplateSuggestion(textoEspelho, file.originalname);
  const campos = suggestFieldsFromText(textoEspelho);

  return res.json({
    success: true,
    suggestion: {
      ...suggestion,
      campos,
      instrucoesIa:
        "Identifique se o arquivo pertence a este modelo e capture os campos cadastrados com base no texto extraido do documento.",
      arquivoEspelhoNome: file.originalname,
      arquivoEspelhoMimeType: file.mimetype,
      arquivoEspelhoSize: file.size,
      textoEspelho,
      dadosEspelho: {
        dados: {},
        confianca: extractionResult.confidence,
        camposFaltantes: []
      }
    },
    extraction: {
      confidence: extractionResult.confidence,
      textPreview: textoEspelho.substring(0, 2000),
      metadata: extractionResult.metadata
    }
  });
};

/**
 * Upload do documento espelho do template
 */
export const uploadTemplateExample = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { templateId } = req.params;
  const { companyId } = req.user;
  const file = req.file;

  if (!file) {
    throw new AppError("Arquivo espelho não enviado", 400);
  }

  if (!DocumentReaderService.isSupportedFileType(file.mimetype)) {
    throw new AppError(
      `Tipo de arquivo não suportado: ${file.mimetype}. Use PDF ou imagens (JPG, JPEG, PNG, TIFF ou BMP)`,
      400
    );
  }

  const template = await TemplateLeitura.findOne({
    where: { id: templateId, companyId }
  });

  if (!template) {
    throw new AppError("Template não encontrado", 404);
  }

  const uploadResult = await DigitalOceanService.upload({
    companyId,
    folder: `templates-leitura/${templateId}`,
    file,
    isPublic: false,
    generateThumbnail: file.mimetype.startsWith("image/")
  });

  const extractionResult = await DocumentReaderService.extractText(
    file.buffer,
    file.mimetype,
    file.originalname
  );

  const textoEspelho = DocumentReaderService.preprocessText(extractionResult.text);
  const parseResult = DocumentParserService.extractData(textoEspelho, template as any);

  if (template.arquivoEspelhoPath) {
    try {
      await DigitalOceanService.delete(template.arquivoEspelhoPath);
    } catch (error) {
      console.error("Erro ao remover arquivo espelho anterior:", error);
    }
  }

  await template.update({
    arquivoEspelhoNome: file.originalname,
    arquivoEspelhoPath: uploadResult.path,
    arquivoEspelhoMimeType: file.mimetype,
    arquivoEspelhoSize: file.size,
    textoEspelho,
    dadosEspelho: {
      dados: parseResult.dados,
      confianca: parseResult.confianca,
      camposFaltantes: parseResult.camposFaltantes
    }
  });

  return res.json({
    success: true,
    template,
    extraction: {
      textPreview: textoEspelho.substring(0, 1000),
      dados: parseResult.dados,
      confianca: parseResult.confianca,
      camposFaltantes: parseResult.camposFaltantes
    }
  });
};
