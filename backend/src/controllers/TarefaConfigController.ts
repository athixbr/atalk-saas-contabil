import { Request, Response } from "express";
import ListTarefasConfigService from "../services/TarefaConfigServices/ListTarefasConfigService";
import ShowTarefaConfigService from "../services/TarefaConfigServices/ShowTarefaConfigService";
import CreateTarefaConfigService from "../services/TarefaConfigServices/CreateTarefaConfigService";
import UpdateTarefaConfigService from "../services/TarefaConfigServices/UpdateTarefaConfigService";
import DeleteTarefaConfigService from "../services/TarefaConfigServices/DeleteTarefaConfigService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam, departamentoId, ativo, page = "1", limit = "10" } = req.query as any;

  const { tarefas, count, hasMore } = await ListTarefasConfigService({
    companyId,
    searchParam,
    departamentoId: departamentoId ? parseInt(departamentoId) : undefined,
    ativo: ativo !== undefined ? ativo === "true" : undefined,
    page: parseInt(page),
    limit: parseInt(limit),
  });

  return res.json({ tarefas, count, hasMore });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { tarefaConfigId } = req.params;

  const tarefa = await ShowTarefaConfigService({
    id: parseInt(tarefaConfigId),
    companyId,
  });

  return res.json(tarefa);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const {
    titulo,
    descricao,
    departamentoId,
    temVencimento,
    diasParaVencimento,
    statusId,
    diasLembrete,
    prazoId,
    aceitaArquivos,
    ativo,
    checklist,
    sabadoUtil,
    diasNaoUteis,
    tarefaInterna,
    valorReferencial,
  } = req.body;

  const tarefa = await CreateTarefaConfigService({
    titulo,
    descricao,
    departamentoId,
    temVencimento,
    diasParaVencimento,
    statusId,
    diasLembrete,
    prazoId,
    aceitaArquivos,
    ativo,
    checklist: checklist || [],
    sabadoUtil,
    diasNaoUteis,
    tarefaInterna,
    valorReferencial,
    companyId,
  });

  return res.status(201).json(tarefa);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { tarefaConfigId } = req.params;
  const {
    titulo,
    descricao,
    departamentoId,
    temVencimento,
    diasParaVencimento,
    statusId,
    diasLembrete,
    prazoId,
    aceitaArquivos,
    ativo,
    checklist,
    sabadoUtil,
    diasNaoUteis,
    tarefaInterna,
    valorReferencial,
  } = req.body;

  const tarefa = await UpdateTarefaConfigService({
    tarefaConfigId: parseInt(tarefaConfigId),
    titulo,
    descricao,
    departamentoId,
    temVencimento,
    diasParaVencimento,
    statusId,
    diasLembrete,
    prazoId,
    aceitaArquivos,
    ativo,
    checklist: checklist || [],
    sabadoUtil,
    diasNaoUteis,
    tarefaInterna,
    valorReferencial,
    companyId,
  });

  return res.json(tarefa);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { tarefaConfigId } = req.params;

  await DeleteTarefaConfigService({
    tarefaConfigId: parseInt(tarefaConfigId),
    companyId,
  });

  return res.status(204).send();
};
