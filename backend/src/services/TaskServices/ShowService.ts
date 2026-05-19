import Task from "../../models/Task";
import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Ticket from "../../models/Ticket";
import TarefaConfig from "../../models/TarefaConfig";
import TarefaConfigChecklist from "../../models/TarefaConfigChecklist";
import Prioridade from "../../models/Prioridade";
import Cliente from "../../models/Cliente";
import Departamento from "../../models/Departamento";

const TaskService = async (id: string | number, companyId: number): Promise<Task> => {
  const task = await Task.findByPk(id, {
    include: [
      { model: Contact, as: "contact", attributes: ["id", "name"] },
      { model: User, as: "user", attributes: ["id", "name"] },
      { model: User, as: "creator", attributes: ["id", "name", "email"] },
      { model: Ticket, as: "ticket", attributes: ["id"] },
      { 
        model: TarefaConfig, 
        as: "tarefaConfig", 
        attributes: ["id", "titulo", "descricao"],
        include: [
          { 
            model: TarefaConfigChecklist, 
            as: "checklist",
            attributes: ["id", "text", "order", "image"]
          }
        ]
      },
      { model: Prioridade, as: "prioridade", attributes: ["id", "nome", "cor"] },
      { model: Cliente, as: "cliente", attributes: ["id", "nomeFantasia", "razaoSocial"] },
      { model: Departamento, as: "departamento", attributes: ["id", "nome"] }
    ]
  });

  if (task?.companyId !== companyId) {
    throw new AppError("Não é possível visualizar registro de outra empresa");
  }

  if (!task) {
    throw new AppError("ERR_NO_TASK_FOUND", 404);
  }

  // Se a tarefa tem tarefaConfig com checklist mas não tem checklistProgresso, inicializar
  if (task.tarefaConfig && task.tarefaConfig.checklist && task.tarefaConfig.checklist.length > 0) {
    if (!task.checklistProgresso || task.checklistProgresso.length === 0) {
      const checklistInicial = task.tarefaConfig.checklist.map((item: any) => ({
        texto: item.text,
        concluido: false
      }));
      await task.update({ checklistProgresso: checklistInicial });
      await task.reload({
        include: [
          { model: Contact, as: "contact", attributes: ["id", "name"] },
          { model: User, as: "user", attributes: ["id", "name"] },
          { model: User, as: "creator", attributes: ["id", "name", "email"] },
          { model: Ticket, as: "ticket", attributes: ["id"] },
          { 
            model: TarefaConfig, 
            as: "tarefaConfig", 
            attributes: ["id", "titulo", "descricao"],
            include: [
              { 
                model: TarefaConfigChecklist, 
                as: "checklist",
                attributes: ["id", "text", "order", "image"]
              }
            ]
          },
          { model: Prioridade, as: "prioridade", attributes: ["id", "nome", "cor"] },
          { model: Cliente, as: "cliente", attributes: ["id", "nomeFantasia", "razaoSocial"] },
          { model: Departamento, as: "departamento", attributes: ["id", "nome"] }
        ]
      });
    }
  }

  return task;
};

export default TaskService;
