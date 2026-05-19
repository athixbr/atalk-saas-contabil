import TaskHistory from "../../models/TaskHistory";
import User from "../../models/User";
import Task from "../../models/Task";
import AppError from "../../errors/AppError";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  taskId: string | number;
  companyId: number;
  userId?: number | string;
  userProfile?: string;
}

const TaskHistoryService = async ({
  taskId,
  companyId,
  userId,
  userProfile
}: Request): Promise<TaskHistory[]> => {
  // Busca a tarefa para verificar permissões
  const task = await Task.findOne({
    where: {
      id: taskId,
      companyId
    }
  });

  if (!task) {
    throw new AppError("Tarefa não encontrada", 404);
  }

  // Admin pode ver histórico de todas as tarefas
  // Usuário comum só pode ver histórico de suas próprias tarefas
  if (userProfile !== "admin" && task.userId !== Number(userId)) {
    throw new AppError("Você não tem permissão para ver este histórico", 403);
  }

  const history = await TaskHistory.findAll({
    where: {
      taskId,
      companyId
    },
    include: [
      {
        model: User,
        as: "fromUser",
        attributes: ["id", "name", "email"]
      },
      {
        model: User,
        as: "toUser",
        attributes: ["id", "name", "email"]
      },
      {
        model: User,
        as: "performer",
        attributes: ["id", "name", "email"]
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  return history;
};

export default TaskHistoryService;
