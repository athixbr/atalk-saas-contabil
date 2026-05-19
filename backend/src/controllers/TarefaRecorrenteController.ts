import { Request, Response } from "express";
import CreateTarefaRecorrenteService from "../services/TarefaRecorrenteService/CreateTarefaRecorrenteService";
import ListTarefasRecorrentesService from "../services/TarefaRecorrenteService/ListTarefasRecorrentesService";
import ShowTarefaRecorrenteService from "../services/TarefaRecorrenteService/ShowTarefaRecorrenteService";
import UpdateTarefaRecorrenteService from "../services/TarefaRecorrenteService/UpdateTarefaRecorrenteService";
import DeleteTarefaRecorrenteService from "../services/TarefaRecorrenteService/DeleteTarefaRecorrenteService";

type IndexQuery = {
  page?: string;
  pageSize?: string;
  searchParam?: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { page, pageSize, searchParam } = req.query as IndexQuery;

  const { tarefas, count, hasMore } = await ListTarefasRecorrentesService({
    companyId,
    page: page ? parseInt(page, 10) : 1,
    pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    searchParam
  });

  return res.json({ tarefas, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const data = req.body;

  const tarefaRecorrente = await CreateTarefaRecorrenteService({
    ...data,
    companyId,
    userId: Number(userId)
  });

  return res.status(201).json(tarefaRecorrente);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const tarefaRecorrente = await ShowTarefaRecorrenteService({
    id,
    companyId
  });

  return res.json(tarefaRecorrente);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { id } = req.params;
  const data = req.body;

  const tarefaRecorrente = await UpdateTarefaRecorrenteService({
    id: Number(id),
    companyId,
    userId: Number(userId),
    data
  });

  return res.json(tarefaRecorrente);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteTarefaRecorrenteService({ id: Number(id), companyId });

  return res.status(204).send();
};
