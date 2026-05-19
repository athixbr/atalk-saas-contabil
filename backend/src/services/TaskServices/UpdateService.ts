import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Task from "../../models/Task";
import TaskHistory from "../../models/TaskHistory";
import ShowService from "./ShowService";

interface TaskData {
  id?: number;
  title?: string;
  description?: string;
  contactId?: number;
  companyId?: number;
  ticketId?: number;
  userId?: number;
  status?: string;
  dueDate?: Date | string;
  tarefaConfigId?: number;
  prioridadeId?: number;
  clienteId?: number;
  departamentoId?: number;
  checklistProgresso?: any;
  observacao?: string;
  valor?: number;
}

interface Request {
  taskData: TaskData;
  id: string | number;
  companyId: number;
  performedBy?: number;
}

const UpdateTaskService = async ({
  taskData,
  id,
  companyId,
  performedBy
}: Request): Promise<Task | undefined> => {
  const task = await ShowService(id, companyId);

  if (task?.companyId !== companyId) {
    throw new AppError("Não é possível alterar registros de outra empresa");
  }

  const schema = Yup.object().shape({
    title: Yup.string().min(3)
  });

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
    checklistProgresso,
    observacao,
    valor
  } = taskData;

  try {
    await schema.validate({ title });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // Captura valores anteriores para histórico
  const previousValues = {
    title: task.title,
    description: task.description,
    status: task.status,
    userId: task.userId,
    dueDate: task.dueDate,
    tarefaConfigId: task.tarefaConfigId,
    prioridadeId: task.prioridadeId,
    clienteId: task.clienteId,
    departamentoId: task.departamentoId
  };

  await task.update({
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
    checklistProgresso,
    valor
  });

  await task.reload();

  // Registrar mudanças importantes no histórico
  const changedFields: string[] = [];
  if (status && status !== previousValues.status) {
    changedFields.push('status');
  }
  if (userId && userId !== previousValues.userId) {
    changedFields.push('userId');
  }
  if (title && title !== previousValues.title) {
    changedFields.push('title');
  }

  // Se houve mudanças importantes OU observação, registrar no histórico
  if ((changedFields.length > 0 || observacao) && performedBy) {
    try {
      const newValues = {
        title: task.title,
        description: task.description,
        status: task.status,
        userId: task.userId,
        dueDate: task.dueDate,
        tarefaConfigId: task.tarefaConfigId,
        prioridadeId: task.prioridadeId,
        clienteId: task.clienteId,
        departamentoId: task.departamentoId
      };

      let actionType = 'updated';
      if (changedFields.includes('status')) {
        actionType = 'status_changed';
      } else if (changedFields.includes('userId')) {
        actionType = 'transferred';
      }

      await TaskHistory.create({
        taskId: task.id,
        fromUserId: previousValues.userId,
        toUserId: task.userId,
        actionType,
        previousValue: JSON.stringify(previousValues),
        newValue: JSON.stringify(newValues),
        performedBy,
        notes: observacao || null,
        companyId
      });
    } catch (historyError) {
      console.error("Erro ao criar histórico da tarefa:", historyError);
      // Não falha a atualização se o histórico falhar
    }
  }

  return task;
};

export default UpdateTaskService;
