import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import fs from "fs";
import path from "path";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import AppError from "../errors/AppError";

import CreateService from "../services/TaskServices/CreateService";
import ListService from "../services/TaskServices/ListService";
import UpdateService from "../services/TaskServices/UpdateService";
import ShowService from "../services/TaskServices/ShowService";
import DeleteService from "../services/TaskServices/DeleteService";
import TransferTaskService from "../services/TaskServices/TransferTaskService";
import TaskHistoryService from "../services/TaskServices/TaskHistoryService";
import UpdateChecklistService from "../services/TaskServices/UpdateChecklistService";
import Task from "../models/Task";
import sequelizeDb from "../database";
import { Sequelize } from "sequelize-typescript";

type IndexQuery = {
  searchParam?: string;
  contactId?: number | string;
  userId?: number | string;
  status?: string;
  excludeStatus?: string;
  filterPeriod?: string;
  pageNumber?: string | number;
  clienteId?: string;
  prioridadeId?: string;
  departamentoId?: string;
  prazoId?: string;
  tipo?: string; // 'todas' | 'tarefa' | 'controle'
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { contactId, userId, status, excludeStatus, filterPeriod, pageNumber, searchParam, clienteId, prioridadeId, departamentoId, prazoId, tipo } = req.query as IndexQuery;
  const { companyId, profile } = req.user;
  const requestUserId = req.user.id;

  const { tasks, count, hasMore } = await ListService({
    searchParam,
    contactId,
    userId,
    status,
    excludeStatus,
    filterPeriod,
    pageNumber,
    companyId,
    profile,
    requestUserId,
    clienteId,
    prioridadeId,
    departamentoId,
    prazoId,
    tipo: tipo || "todas"
  });

  return res.json({ tasks, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    title,
    description,
    contactId,
    ticketId,
    userId,
    status,
    dueDate,
    tarefaConfigId,
    prioridadeId,
    clienteId,
    departamentoId,
    dataHoraCriacao,
    valor
  } = req.body;
  const { companyId, id: createdBy } = req.user;

  let task = await CreateService({
    title,
    description,
    contactId,
    ticketId,
    companyId,
    userId,
    createdBy,
    status: status || "Pendente",
    dueDate,
    tarefaConfigId,
    prioridadeId,
    clienteId,
    departamentoId,
    dataHoraCriacao,
    valor
  });

  task = await ShowService(task.id, companyId);
  
  const io = getIO();
  io.emit(`company${companyId}-task`, {
    action: "create",
    task
  });

  return res.status(200).json(task);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { taskId } = req.params;
  const { companyId } = req.user;

  const task = await ShowService(taskId, companyId);

  return res.status(200).json(task);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { taskId } = req.params;
  const taskData = req.body;
  const { companyId, id } = req.user;
  const performedBy = typeof id === 'string' ? parseInt(id) : id;

  const task = await UpdateService({ 
    taskData, 
    id: parseInt(taskId), 
    companyId,
    performedBy 
  });

  const io = getIO();
  io.emit(`company${companyId}-task`, {
    action: "update",
    task
  });

  return res.status(200).json(task);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { taskId } = req.params;
  const { companyId, id: userId, profile } = req.user;

  await DeleteService({
    taskId,
    companyId,
    userId,
    userProfile: profile
  });

  const io = getIO();
  io.emit(`company${companyId}-task`, {
    action: "delete",
    taskId
  });

  return res.status(200).json({ message: "Task deleted" });
};

export const transfer = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { taskId } = req.params;
  const { toUserId, notes } = req.body;
  const { companyId, id: performedBy, profile: userProfile } = req.user;

  if (!toUserId) {
    throw new AppError("ERR_TO_USER_REQUIRED", 400);
  }

  const task = await TransferTaskService({
    taskId,
    toUserId,
    notes,
    companyId,
    performedBy,
    userProfile
  });

  const io = getIO();
  io.emit(`company${companyId}-task`, {
    action: "transfer",
    task
  });

  return res.status(200).json(task);
};

export const history = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { taskId } = req.params;
  const { companyId, id: userId, profile } = req.user;

  const taskHistory = await TaskHistoryService({
    taskId,
    companyId,
    userId,
    userProfile: profile
  });

  return res.status(200).json(taskHistory);
};

export const updateChecklist = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { taskId } = req.params;
  const { checklistProgresso } = req.body;
  const { companyId } = req.user;

  const task = await UpdateChecklistService({
    taskId: parseInt(taskId),
    checklistProgresso,
    companyId
  });

  const io = getIO();
  io.emit(`company${companyId}-task`, {
    action: "update",
    task
  });

  return res.status(200).json(task);
};

export const updateHistory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { historyId } = req.params;
  const { notes } = req.body;
  const { companyId, id: userId } = req.user;

  const TaskHistory = (await import("../models/TaskHistory")).default;
  
  const history = await TaskHistory.findOne({
    where: { id: historyId }
  });

  if (!history) {
    throw new AppError("Histórico não encontrado", 404);
  }

  // Admin pode editar qualquer registro, usuários comuns só seus próprios
  const { profile } = req.user;
  if (profile !== "admin" && history.performedBy !== Number(userId)) {
    throw new AppError("Você não pode editar este registro", 403);
  }

  await history.update({ notes });

  return res.status(200).json(history);
};

export const deleteHistory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { historyId } = req.params;
  const { companyId, id: userId } = req.user;

  const TaskHistory = (await import("../models/TaskHistory")).default;
  
  const history = await TaskHistory.findOne({
    where: { id: historyId }
  });

  if (!history) {
    throw new AppError("Histórico não encontrado", 404);
  }

  // Admin pode excluir qualquer registro, usuários comuns só seus próprios
  const { profile } = req.user;
  if (profile !== "admin" && history.performedBy !== Number(userId)) {
    throw new AppError("Você não pode excluir este registro", 403);
  }

  await history.destroy();

  return res.status(200).json({ message: "Histórico excluído com sucesso" });
};

export const uploadFile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { taskId } = req.params;
  const { companyId, id: userId } = req.user;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new AppError("Nenhum arquivo enviado", 400);
  }

  const task = await ShowService(taskId, companyId);

  if (!task) {
    throw new AppError("Tarefa não encontrada", 404);
  }

  // Verificar se a tarefa aceita arquivos
  const tarefaConfig = task.tarefaConfig;
  if (!tarefaConfig || !tarefaConfig.aceitaArquivos) {
    throw new AppError("Esta tarefa não aceita arquivos", 403);
  }

  // Preparar array de arquivos
  const arquivos = task.arquivos ? JSON.parse(JSON.stringify(task.arquivos)) : [];
  
  files.forEach((file: Express.Multer.File) => {
    arquivos.push({
      fileName: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadedBy: userId,
      uploadedAt: new Date()
    });
  });

  await task.update({ arquivos });

  const io = getIO();
  io.emit(`company${companyId}-task`, {
    action: "update",
    task: await ShowService(taskId, companyId)
  });

  return res.status(200).json({ message: "Arquivo(s) enviado(s) com sucesso", arquivos });
};

export const listFiles = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { taskId } = req.params;
  const { companyId } = req.user;

  const task = await ShowService(taskId, companyId);

  if (!task) {
    throw new AppError("Tarefa não encontrada", 404);
  }

  const arquivos = task.arquivos || [];

  return res.status(200).json(arquivos);
};

export const deleteFile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { taskId, fileName } = req.params;
  const { companyId, id: userId, profile } = req.user;

  const task = await ShowService(taskId, companyId);

  if (!task) {
    throw new AppError("Tarefa não encontrada", 404);
  }

  const arquivos = task.arquivos ? JSON.parse(JSON.stringify(task.arquivos)) : [];
  const fileIndex = arquivos.findIndex((f: any) => f.fileName === fileName);

  if (fileIndex === -1) {
    throw new AppError("Arquivo não encontrado", 404);
  }

  const arquivo = arquivos[fileIndex];

  // Apenas admin ou quem fez upload pode deletar
  if (profile !== "admin" && arquivo.uploadedBy !== Number(userId)) {
    throw new AppError("Você não pode excluir este arquivo", 403);
  }

  // Deletar arquivo físico
  try {
    if (fs.existsSync(arquivo.path)) {
      fs.unlinkSync(arquivo.path);
    }
  } catch (error) {
    console.error("Erro ao deletar arquivo físico:", error);
  }

  // Remover do array
  arquivos.splice(fileIndex, 1);

  await task.update({ arquivos });

  const io = getIO();
  io.emit(`company${companyId}-task`, {
    action: "update",
    task: await ShowService(taskId, companyId)
  });

  return res.status(200).json({ message: "Arquivo excluído com sucesso" });
};

export const getUserStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const userId = req.params.userId || req.user.id;

    console.log('getUserStats - userId:', userId, 'companyId:', companyId);

    // Buscar estatísticas gerais
    const stats = await Task.findAll({
      where: {
        userId,
        companyId,
        deletedAt: null
      },
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    console.log('getUserStats - stats:', stats);

    // Buscar tarefas concluídas nos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCompleted = await Task.count({
      where: {
        userId,
        companyId,
        status: 'Concluída',
        updatedAt: {
          [Op.gte]: thirtyDaysAgo
        },
        deletedAt: null
      }
    });

    // Buscar tarefas por mês (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const tasksByMonth = await Task.findAll({
      where: {
        userId,
        companyId,
        createdAt: {
          [Op.gte]: sixMonthsAgo
        },
        deletedAt: null
      },
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), '%Y-%m'), 'month'],
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['month', 'status'],
      order: [[Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), '%Y-%m'), 'ASC']],
      raw: true
    });

    // Buscar total de tarefas
    const totalTasks = await Task.count({
      where: {
        userId,
        companyId,
        deletedAt: null
      }
    });

    // Buscar tarefas atrasadas
    const overdueTasks = await Task.count({
      where: {
        userId,
        companyId,
        status: {
          [Op.notIn]: ['Concluída', 'Cancelada']
        },
        dueDate: {
          [Op.lt]: new Date()
        },
        deletedAt: null
      }
    });

    console.log('getUserStats - resultado:', {
      totalStats: stats.length,
      recentCompleted,
      totalTasks,
      overdueTasks
    });

    return res.json({
      stats,
      recentCompleted,
      tasksByMonth,
      totalTasks,
      overdueTasks
    });
  } catch (error) {
    console.error('getUserStats - Erro:', error);
    return res.status(500).json({ 
      error: 'Erro ao buscar estatísticas',
      message: error.message,
      stack: error.stack
    });
  }
};


