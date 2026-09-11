import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";

import * as CertidaoController from "../controllers/CertidaoController";

const certidaoRoutes = express.Router();

// Configuração do multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".pfx", ".p12"];
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf("."));
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos .pfx ou .p12 são permitidos"));
    }
  }
});

// ==================== ROTAS DE AGENDAMENTOS ====================
certidaoRoutes.get("/certidoes/agendamentos", isAuth, CertidaoController.indexAgendamentos);
certidaoRoutes.post("/certidoes/agendamentos", isAuth, CertidaoController.storeAgendamento);
certidaoRoutes.get("/certidoes/agendamentos/:agendamentoId", isAuth, CertidaoController.showAgendamento);
certidaoRoutes.put("/certidoes/agendamentos/:agendamentoId", isAuth, CertidaoController.updateAgendamento);
certidaoRoutes.delete("/certidoes/agendamentos/:agendamentoId", isAuth, CertidaoController.removeAgendamento);
certidaoRoutes.post("/certidoes/agendamentos/:agendamentoId/processar", isAuth, CertidaoController.processarAgendamento);
certidaoRoutes.post("/certidoes/agendamentos-processar-pendentes", isAuth, CertidaoController.processarAgendamentosPendentes);

// ==================== ROTAS DE CERTIFICADO DIGITAL ====================
certidaoRoutes.get("/certidoes/certificado", isAuth, CertidaoController.showCertificado);
certidaoRoutes.post("/certidoes/certificado", isAuth, upload.single("certificado"), CertidaoController.uploadCertificado);
certidaoRoutes.put("/certidoes/certificado/:certificadoId", isAuth, CertidaoController.updateCertificado);
certidaoRoutes.get("/certidoes/certificado/:certificadoId/senha", isAuth, CertidaoController.senhaCertificado);
certidaoRoutes.post("/certidoes/certificado/:certificadoId/enviar-aviso", isAuth, CertidaoController.enviarAvisoCertificado);
certidaoRoutes.delete("/certidoes/certificado/:certificadoId", isAuth, CertidaoController.removeCertificado);

// ==================== ROTAS DE ACESSOS GOV ====================
certidaoRoutes.get("/documentos/acessos", isAuth, CertidaoController.indexAcessos);
certidaoRoutes.post("/documentos/acessos", isAuth, CertidaoController.storeAcesso);
certidaoRoutes.put("/documentos/acessos/:acessoId", isAuth, CertidaoController.updateAcesso);
certidaoRoutes.delete("/documentos/acessos/:acessoId", isAuth, CertidaoController.removeAcesso);

// ==================== ROTAS DE CERTIDÕES (Histórico) ====================
certidaoRoutes.get("/certidoes", isAuth, CertidaoController.indexCertidoes);
certidaoRoutes.get("/certidoes/:certidaoId/download", isAuth, CertidaoController.downloadCertidao);
certidaoRoutes.get("/certidoes/:certidaoId/visualizar", isAuth, CertidaoController.visualizarCertidao);

// ==================== ROTAS DE CONSULTA (API INFO SIMPLES) ====================
certidaoRoutes.post("/certidoes/consultar", isAuth, CertidaoController.consultarCertidao);
certidaoRoutes.post("/certidoes/:certidaoId/reprocessar", isAuth, CertidaoController.reprocessarCertidao);
certidaoRoutes.post("/certidoes/reprocessar-pendentes", isAuth, CertidaoController.reprocessarCertidoesPendentes);

// ==================== ROTAS DE LOGS ====================
certidaoRoutes.get("/certidoes/:certidaoId/logs", isAuth, CertidaoController.indexLogsCertidao);

export default certidaoRoutes;
