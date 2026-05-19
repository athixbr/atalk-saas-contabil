import Task from "../../models/Task";
import TaskHistory from "../../models/TaskHistory";
import User from "../../models/User";
import AppError from "../../errors/AppError";

interface Request {
  taskId: string | number;
  toUserId: number;
  notes?: string;
  companyId: number;
  performedBy: string | number;
  userProfile: string;
}

const TransferTaskService = async ({
  taskId,
  toUserId,
  notes,
  companyId,
  performedBy,
  userProfile
}: Request): Promise<Task> => {
  const task = await Task.findOne({
    where: { id: taskId, companyId, deletedAt: null },
    include: ["user"]
  });

  if (!task) {
    throw new AppError("ERR_NO_TASK_FOUND", 404);
  }

  // REGRA: Usuário comum só pode transferir tarefas que estão com ele
  // Admin pode transferir qualquer tarefa
  const isAdmin = userProfile === "admin";
  const isTaskOwner = task.userId === parseInt(performedBy.toString());

  if (!isAdmin && !isTaskOwner) {
    throw new AppError("ERR_NO_PERMISSION_TRANSFER_TASK", 403);
  }

  // Verificar se o usuário de destino existe
  const toUser = await User.findOne({
    where: { id: toUserId, companyId }
  });

  if (!toUser) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  const previousUserId = task.userId;

  // Atualizar tarefa
  await task.update({
    userId: toUserId
  });

  // Registrar no histórico
  await TaskHistory.create({
    taskId: task.id,
    fromUserId: previousUserId,
    toUserId: toUserId,
    actionType: "transferred",
    previousValue: JSON.stringify({
      userId: previousUserId,
      userName: task.user?.name
    }),
    newValue: JSON.stringify({
      userId: toUserId,
      userName: toUser.name
    }),
    performedBy: parseInt(performedBy.toString()),
    notes,
    companyId
  });

  await task.reload({
    include: ["user", "creator", "contact", "ticket"]
  });

  return task;
};

export default TransferTaskService;
