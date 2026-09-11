import express from "express";
import isAuth from "../middleware/isAuth";
import multer from "multer";

import * as DocumentReaderController from "../controllers/DocumentReaderController";

const documentReaderRoutes = express.Router();

// Configurar multer para memória (não salvar em disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// ========== Rotas de Templates ==========

// Listar templates disponíveis
documentReaderRoutes.get("/templates-leitura", isAuth, DocumentReaderController.listTemplates);

// Obter template específico
documentReaderRoutes.get("/templates-leitura/:templateId", isAuth, DocumentReaderController.getTemplate);

// Criar novo template
documentReaderRoutes.post("/templates-leitura", isAuth, DocumentReaderController.createTemplate);

// Analisar arquivo para sugerir cadastro de template
documentReaderRoutes.post(
  "/templates-leitura/analisar-arquivo",
  isAuth,
  upload.single("file"),
  DocumentReaderController.analyzeTemplateFile
);

// Atualizar template
documentReaderRoutes.put("/templates-leitura/:templateId", isAuth, DocumentReaderController.updateTemplate);

// Enviar documento espelho do template
documentReaderRoutes.post(
  "/templates-leitura/:templateId/espelho",
  isAuth,
  upload.single("file"),
  DocumentReaderController.uploadTemplateExample
);

// Excluir template
documentReaderRoutes.delete("/templates-leitura/:templateId", isAuth, DocumentReaderController.deleteTemplate);

// ========== Rotas de Arquivos de Tarefas ==========

// Upload e leitura automática de documento
documentReaderRoutes.post(
  "/tasks/:taskId/documents/upload",
  isAuth,
  upload.single("file"),
  DocumentReaderController.uploadAndReadDocument
);

// Listar arquivos de uma tarefa
documentReaderRoutes.get("/tasks/:taskId/documents", isAuth, DocumentReaderController.listTaskFiles);

// Obter detalhes de um arquivo específico
documentReaderRoutes.get("/documents/:fileId", isAuth, DocumentReaderController.getTaskFile);

// Download de arquivo (gera URL assinada)
documentReaderRoutes.get("/documents/:fileId/download", isAuth, DocumentReaderController.downloadTaskFile);

// Reprocessar arquivo com template diferente
documentReaderRoutes.post("/documents/:fileId/reprocess", isAuth, DocumentReaderController.reprocessTaskFile);

// Atualizar dados extraídos manualmente
documentReaderRoutes.put("/documents/:fileId/data", isAuth, DocumentReaderController.updateExtractedData);

// Deletar arquivo
documentReaderRoutes.delete("/documents/:fileId", isAuth, DocumentReaderController.deleteTaskFile);

export default documentReaderRoutes;
