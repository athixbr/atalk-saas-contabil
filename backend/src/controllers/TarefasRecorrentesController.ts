import { Request, Response } from "express";
import CreateTarefaRecorrenteService from "../services/TarefaRecorrenteService/CreateTarefaRecorrenteService";
import ListTarefasRecorrentesService from "../services/TarefaRecorrenteService/ListTarefasRecorrentesService";
import ShowTarefaRecorrenteService from "../services/TarefaRecorrenteService/ShowTarefaRecorrenteService";
import UpdateTarefaRecorrenteService from "../services/TarefaRecorrenteService/UpdateTarefaRecorrenteService";
import DeleteTarefaRecorrenteService from "../services/TarefaRecorrenteService/DeleteTarefaRecorrenteService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { searchParam = "", pageNumber = "1" } = req.query as any;

    const result = await ListTarefasRecorrentesService({
      companyId: Number(companyId),
      searchParam,
      page: parseInt(pageNumber, 10)
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao listar tarefas recorrentes:", error);
    return res.status(500).json({ error: "Erro ao listar tarefas recorrentes" });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const tarefaId = Number(id);
    if (!id || isNaN(tarefaId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const tarefa = await ShowTarefaRecorrenteService({
      id: tarefaId,
      companyId: Number(companyId)
    });

    return res.status(200).json(tarefa);
  } catch (error) {
    console.error("Erro ao buscar tarefa recorrente:", error);
    return res.status(500).json({ error: error.message || "Erro ao buscar tarefa recorrente" });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId, id: userId } = req.user;
    const data = req.body;

    const tarefa = await CreateTarefaRecorrenteService({
      ...data,
      companyId: Number(companyId),
      userId: Number(userId)
    });

    return res.status(201).json(tarefa);
  } catch (error) {
    console.error("Erro ao criar tarefa recorrente:", error);
    return res.status(500).json({ error: error.message || "Erro ao criar tarefa recorrente" });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;
    const data = req.body;

    const tarefaId = Number(id);
    if (!id || isNaN(tarefaId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const tarefa = await UpdateTarefaRecorrenteService({
      id: tarefaId,
      companyId: Number(companyId),
      userId: Number(userId),
      data
    });

    return res.status(200).json(tarefa);
  } catch (error) {
    console.error("Erro ao atualizar tarefa recorrente:", error);
    return res.status(500).json({ error: error.message || "Erro ao atualizar tarefa recorrente" });
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const tarefaId = Number(id);
    if (!id || isNaN(tarefaId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    await DeleteTarefaRecorrenteService({
      id: tarefaId,
      companyId: Number(companyId)
    });

    return res.status(200).json({ message: "Tarefa recorrente removida com sucesso" });
  } catch (error) {
    console.error("Erro ao remover tarefa recorrente:", error);
    return res.status(500).json({ error: error.message || "Erro ao remover tarefa recorrente" });
  }
};
