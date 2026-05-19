import * as Yup from "yup";
import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import AppError from "../errors/AppError";

import ListAgendamentosService from "../services/CertidaoServices/ListAgendamentosService";
import CreateAgendamentoService from "../services/CertidaoServices/CreateAgendamentoService";
import ShowAgendamentoService from "../services/CertidaoServices/ShowAgendamentoService";
import UpdateAgendamentoService from "../services/CertidaoServices/UpdateAgendamentoService";
import DeleteAgendamentoService from "../services/CertidaoServices/DeleteAgendamentoService";
import ProcessarAgendamentosService from "../services/CertidaoServices/ProcessarAgendamentosService";

import ShowCertificadoDigitalService from "../services/CertidaoServices/ShowCertificadoDigitalService";
import UploadCertificadoDigitalService from "../services/CertidaoServices/UploadCertificadoDigitalService";
import DeleteCertificadoDigitalService from "../services/CertidaoServices/DeleteCertificadoDigitalService";

import ListCertidoesService from "../services/CertidaoServices/ListCertidoesService";

import ConsultarCertidaoService from "../services/CertidaoServices/ConsultarCertidaoService";
import Certidao from "../models/Certidao";
import { ReprocessarCertidoesService, ReprocessarCertidaoManualService } from "../services/CertidaoServices/ReprocessarCertidaoService";
import ListLogsCertidaoService from "../services/CertidaoServices/ListLogsCertidaoService";

// ==================== AGENDAMENTOS ====================

export const indexAgendamentos = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const agendamentos = await ListAgendamentosService(companyId);

  return res.json(agendamentos);
};

export const storeAgendamento = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    data: Yup.date().required("Data é obrigatória"),
    hora: Yup.string().required("Hora é obrigatória"),
    descricao: Yup.string(),
    clienteIds: Yup.array().of(Yup.number()).min(1, "Selecione pelo menos um cliente"),
    certidoesCategoriasIds: Yup.array().of(Yup.string()),
    intervaloMinutos: Yup.number().min(1).max(60)
  });

  try {
    await schema.validate(req.body);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const agendamento = await CreateAgendamentoService({
    ...req.body,
    companyId
  });

  return res.status(200).json(agendamento);
};

export const showAgendamento = async (req: Request, res: Response): Promise<Response> => {
  const { agendamentoId } = req.params;
  const { companyId } = req.user;

  const agendamento = await ShowAgendamentoService(agendamentoId, companyId);

  return res.status(200).json(agendamento);
};

export const updateAgendamento = async (req: Request, res: Response): Promise<Response> => {
  const { agendamentoId } = req.params;
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    data: Yup.date(),
    hora: Yup.string(),
    descricao: Yup.string(),
    clienteIds: Yup.array().of(Yup.number()),
    status: Yup.string().oneOf(["pendente", "processando", "concluido", "erro"]),
    certidoesCategoriasIds: Yup.array().of(Yup.string()),
    intervaloMinutos: Yup.number().min(1).max(60)
  });

  try {
    await schema.validate(req.body);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const agendamento = await UpdateAgendamentoService({
    agendamentoData: req.body,
    agendamentoId,
    companyId
  });

  return res.status(200).json(agendamento);
};

export const removeAgendamento = async (req: Request, res: Response): Promise<Response> => {
  const { agendamentoId } = req.params;
  const { companyId } = req.user;

  await DeleteAgendamentoService(agendamentoId, companyId);

  return res.status(200).json({ message: "Agendamento deletado com sucesso" });
};

export const processarAgendamento = async (req: Request, res: Response): Promise<Response> => {
  const { agendamentoId } = req.params;
  const { companyId } = req.user;

  const resultado = await ProcessarAgendamentosService({
    agendamentoId: parseInt(agendamentoId, 10),
    companyId,
    forcarExecucao: true // Modo manual: processa independente da data/hora
  });

  return res.status(200).json(resultado);
};

export const processarAgendamentosPendentes = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const resultado = await ProcessarAgendamentosService({
    companyId,
    forcarExecucao: false // Modo automático: só processa se chegou a hora
  });

  return res.status(200).json(resultado);
};

// ==================== CERTIFICADO DIGITAL ====================

export const showCertificado = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  
  const certificados = await ShowCertificadoDigitalService(companyId);
  
  return res.status(200).json(certificados);
};export const uploadCertificado = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  if (!req.file) {
    throw new AppError("Arquivo de certificado é obrigatório", 400);
  }

  const { password } = req.body;

  if (!password) {
    throw new AppError("Senha do certificado é obrigatória", 400);
  }

  const certificado = await UploadCertificadoDigitalService({
    companyId,
    file: req.file,
    password
  });

  return res.status(200).json(certificado);
};

export const removeCertificado = async (req: Request, res: Response): Promise<Response> => {
  const { certificadoId } = req.params;
  const { companyId } = req.user;

  await DeleteCertificadoDigitalService(certificadoId, companyId);

  return res.status(200).json({ message: "Certificado deletado com sucesso" });
};

// ==================== CERTIDÕES (Histórico) ====================

export const indexCertidoes = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { tipo, categoria, searchParam, pageNumber } = req.query as {
    tipo?: string;
    categoria?: string;
    searchParam?: string;
    pageNumber?: string;
  };

  const { certidoes, count, hasMore } = await ListCertidoesService({
    companyId,
    tipo,
    categoria,
    searchParam,
    pageNumber: pageNumber ? parseInt(pageNumber, 10) : 1
  });

  // Calcular estatísticas pelo tipo filtrado
  const statsWhere: any = { companyId };
  if (tipo) statsWhere.tipo = tipo;

  const [totalCount, emitidasCount, pendentesCount, errosCount] = await Promise.all([
    Certidao.count({ where: statsWhere }),
    Certidao.count({ where: { ...statsWhere, status: "emitida" } }),
    Certidao.count({ where: { ...statsWhere, status: "pendente" } }),
    Certidao.count({ where: { ...statsWhere, status: "erro" } })
  ]);

  const stats = {
    total: totalCount,
    emitidas: emitidasCount,
    pendentes: pendentesCount,
    erros: errosCount
  };

  // Mapear campos do cliente para o nível raiz para facilitar uso no frontend
  const certidoesMapped = certidoes.map((c: any) => {
    const plain = c.toJSON ? c.toJSON() : c;
    return {
      ...plain,
      clienteNome: plain.cliente?.nome || "-",
      clienteCnpj: plain.cliente?.cnpj || plain.cliente?.cpf || "-"
    };
  });

  return res.json({ certidoes: certidoesMapped, count, hasMore, stats });
};

export const downloadCertidao = async (req: Request, res: Response): Promise<void> => {
  const { certidaoId } = req.params;
  const { companyId } = req.user;

  const certidao = await Certidao.findOne({
    where: { id: certidaoId, companyId }
  });

  if (!certidao) {
    throw new AppError("Certidão não encontrada", 404);
  }

  // Para certidões Coplan (Campo Verde) com PDF no DigitalOcean Spaces
  const dadosResposta = certidao.dadosResposta as any;
  const downloadUrl = dadosResposta?.downloadUrl;

  if (certidao.arquivoPdf) {
    const filePath = path.join(__dirname, "..", "..", "public", certidao.arquivoPdf);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
      return;
    }
  }

  // Fallback: redirecionar para URL do DigitalOcean Spaces
  if (downloadUrl) {
    res.redirect(downloadUrl);
    return;
  }

  throw new AppError("PDF não disponível para esta certidão", 404);
};

export const visualizarCertidao = async (req: Request, res: Response): Promise<void> => {
  const { certidaoId } = req.params;
  const { companyId } = req.user;

  const certidao = await Certidao.findOne({
    where: { id: certidaoId, companyId }
  });

  if (!certidao) {
    throw new AppError("Certidão não encontrada", 404);
  }

  // Para certidões Coplan (Campo Verde) com PDF no DigitalOcean Spaces
  const dadosResposta = certidao.dadosResposta as any;
  const downloadUrl = dadosResposta?.downloadUrl;

  if (certidao.arquivoPdf) {
    const filePath = path.join(__dirname, "..", "..", "public", certidao.arquivoPdf);
    if (fs.existsSync(filePath)) {
      res.setHeader("Content-Type", "application/pdf");
      res.sendFile(filePath);
      return;
    }
  }

  // Fallback: redirecionar para URL do DigitalOcean Spaces
  if (downloadUrl) {
    res.redirect(downloadUrl);
    return;
  }

  throw new AppError("PDF não disponível para esta certidão", 404);
};

// ==================== CONSULTAR CERTIDÕES ====================

export const consultarCertidao = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    clienteCertidaoId: Yup.number().when('clienteId', {
      is: (val: any) => !val,
      then: Yup.number().required("Cliente é obrigatório"),
      otherwise: Yup.number()
    }),
    clienteId: Yup.number().when('clienteCertidaoId', {
      is: (val: any) => !val,
      then: Yup.number().required("Cliente é obrigatório"),
      otherwise: Yup.number()
    }),
    categoria: Yup.string().required("Categoria da certidão é obrigatória")
  }, [['clienteCertidaoId', 'clienteId']]);

  try {
    await schema.validate(req.body);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const resultado = await ConsultarCertidaoService({
    clienteId: req.body.clienteId,
    companyId,
    categoria: req.body.categoria
  });

  return res.status(200).json(resultado);
};

export const reprocessarCertidao = async (req: Request, res: Response): Promise<Response> => {
  const { certidaoId } = req.params;
  const { companyId } = req.user;

  const resultado = await ReprocessarCertidaoManualService(
    parseInt(certidaoId, 10),
    companyId
  );

  return res.status(200).json(resultado);
};

export const reprocessarCertidoesPendentes = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const resultado = await ReprocessarCertidoesService(companyId);

  return res.status(200).json(resultado);
};

// ==================== LOGS ====================

export const indexLogsCertidao = async (req: Request, res: Response): Promise<Response> => {
  const { certidaoId } = req.params;
  const { companyId } = req.user;

  const { logs, count, hasMore } = await ListLogsCertidaoService({
    certidaoId: certidaoId ? parseInt(certidaoId, 10) : undefined,
    companyId
  });

  return res.json({ logs, count, hasMore });
};
