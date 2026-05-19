import Task from "../../models/Task";
import TaskHistory from "../../models/TaskHistory";
import AppError from "../../errors/AppError";

interface Request {
  taskId: string | number;
  companyId: number;
  userId: string | number;
  userProfile: string;
}

/**
 * REGRAS DE EXCLUSÃO DE TAREFAS:
 * 
 * 1. ADMIN: Pode deletar QUALQUER tarefa da empresa
 * 2. USUÁRIO COMUM: Pode deletar APENAS tarefas que ELE CRIOU (createdBy)
 * 3. SOFT DELETE: Tarefa não é removida do banco, apenas marcada como deletada
 * 4. HISTÓRICO: Toda exclusão é registrada no TaskHistory
 * 
 * TRANSFERÊNCIA:
 * - ADMIN: Pode transferir qualquer tarefa
 * - USUÁRIO COMUM: Pode transferir apenas tarefas que estão COM ELE (userId)
 */

const DeleteService = async ({
  taskId,
  companyId,
  userId,
  userProfile
}: Request): Promise<void> => {
  const task = await Task.findOne({
    where: { id: taskId, companyId, deletedAt: null }
  });

  if (!task) {
    throw new AppError("ERR_NO_TASK_FOUND", 404);
  }

  // Validar permissão de exclusão
  const isAdmin = userProfile === "admin";
  const isCreator = task.createdBy === parseInt(userId.toString());

  if (!isAdmin && !isCreator) {
    throw new AppError("ERR_NO_PERMISSION_DELETE_TASK", 403);
  }

  // Soft delete
  await task.update({
    deletedAt: new Date(),
    deletedBy: parseInt(userId.toString())
  });

  // Registrar no histórico
  try {
    await TaskHistory.create({
      taskId: task.id,
      fromUserId: task.userId || null,
      toUserId: null,
      actionType: "deleted",
      previousValue: JSON.stringify({
        title: task.title,
        status: task.status,
        userId: task.userId
      }),
      newValue: null,
      performedBy: parseInt(userId.toString()),
      companyId: parseInt(companyId.toString())
    });
  } catch (historyError) {
    console.error("Erro ao criar histórico de exclusão:", historyError);
    // Não falha a exclusão se o histórico falhar
  }
};

export default DeleteService;
