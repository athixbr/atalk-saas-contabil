import { Request, Response } from "express";
import DigitalOceanService from "../services/DigitalOceanService";
import DocumentReaderService from "../services/DocumentReaderService";
import DocumentParserService from "../services/DocumentParserService";
import TaskFile from "../models/TaskFile";
import TemplateLeitura from "../models/TemplateLeitura";
import Task from "../models/Task";
import AppError from "../errors/AppError";

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

  const templates = await TemplateLeitura.findAll({
    where: { companyId, ativo: true },
    attributes: ["id", "nome", "tipo", "descricao"],
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
  const { nome, descricao, tipo, campos, validacoes, exemplos } = req.body;

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
    companyId,
    ativo: true
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
  const { nome, descricao, tipo, campos, validacoes, exemplos, ativo } =
    req.body;

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
    ativo
  });

  return res.json(template);
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
