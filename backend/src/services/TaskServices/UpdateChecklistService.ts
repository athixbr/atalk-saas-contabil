import Task from "../../models/Task";
import AppError from "../../errors/AppError";
import TarefaConfig from "../../models/TarefaConfig";
import TarefaConfigChecklist from "../../models/TarefaConfigChecklist";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Ticket from "../../models/Ticket";
import Prioridade from "../../models/Prioridade";
import Cliente from "../../models/Cliente";
import Departamento from "../../models/Departamento";
import Status from "../../models/Status";

interface Request {
  taskId: number;
  checklistProgresso: Array<{ texto: string; concluido: boolean }>;
  companyId: number;
}

const UpdateChecklistService = async ({
  taskId,
  checklistProgresso,
  companyId
}: Request): Promise<Task> => {
  const task = await Task.findByPk(taskId, {
    include: [
      { 
        model: TarefaConfig, 
        as: "tarefaConfig",
        include: [
          { 
            model: TarefaConfigChecklist, 
            as: "checklist",
            attributes: ["id", "text", "order", "image"]
          }
        ]
      }
    ]
  });

  if (!task) {
    throw new AppError("ERR_NO_TASK_FOUND", 404);
  }

  if (task.companyId !== companyId) {
    throw new AppError("Não é possível atualizar tarefa de outra empresa");
  }

  // Atualizar o progresso do checklist
  await task.update({ checklistProgresso });

  // Calcular porcentagem de conclusão
  const totalItens = checklistProgresso.length;
  const concluidos = checklistProgresso.filter(item => item.concluido).length;
  const porcentagem = totalItens > 0 ? Math.round((concluidos / totalItens) * 100) : 0;

  console.log(`📊 Checklist atualizado - Tarefa #${taskId}: ${concluidos}/${totalItens} (${porcentagem}%)`);

  // Verificar se todos os itens foram concluídos
  const todosCompletos = checklistProgresso.every(item => item.concluido);

  // Se todos concluídos, atualizar status para Concluída
  if (todosCompletos && task.tarefaConfig) {
    const statusConcluido = await Status.findOne({
      where: { nome: "Concluída", companyId }
    });

    if (statusConcluido) {
      await task.update({ status: "Concluída" });
      console.log(`✅ Tarefa #${taskId} marcada como Concluída automaticamente`);
    }
  }

  // Recarregar com todos os dados necessários
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

  return task;
};

export default UpdateChecklistService;
