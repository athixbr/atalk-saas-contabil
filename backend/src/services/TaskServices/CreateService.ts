import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Task from "../../models/Task";
import TaskHistory from "../../models/TaskHistory";
import TarefaConfig from "../../models/TarefaConfig";
import Status from "../../models/Status";

interface Request {
  title: string;
  description?: string;
  contactId?: number | string;
  ticketId?: number | string;
  companyId: number | string;
  userId?: number | string;
  createdBy?: number | string;
  status?: string;
  dueDate?: Date | string;
  tarefaConfigId?: number | string;
  prioridadeId?: number | string;
  clienteId?: number | string;
  departamentoId?: number | string;
  dataHoraCriacao?: Date | string;
  valor?: number | string;
}

const CreateService = async ({
  title,
  description,
  contactId,
  ticketId,
  companyId,
  userId,
  createdBy,
  status,
  dueDate,
  tarefaConfigId,
  prioridadeId,
  clienteId,
  departamentoId,
  dataHoraCriacao,
  valor
}: Request): Promise<Task> => {
  const schema = Yup.object().shape({
    title: Yup.string().required().min(3)
  });

  try {
    await schema.validate({ title });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // Garantir que userId e createdBy sejam números válidos ou null
  const finalUserId = userId ? parseInt(userId.toString()) : null;
  const finalCreatedBy = createdBy ? parseInt(createdBy.toString()) : finalUserId;

  // Se tarefaConfigId foi fornecido, buscar o status da configuração
  let finalStatus = status || "Pendente";
  let checklistInicial = null;
  
  if (tarefaConfigId) {
    const tarefaConfig = await TarefaConfig.findByPk(parseInt(tarefaConfigId.toString()), {
      include: [{ model: Status, as: "status", attributes: ["id", "nome"] }]
    });
    if (tarefaConfig && tarefaConfig.status) {
      finalStatus = tarefaConfig.status.nome;
    }
    // Inicializar checklist se existir
    if (tarefaConfig && tarefaConfig.checklist && tarefaConfig.checklist.length > 0) {
      checklistInicial = tarefaConfig.checklist.map((item: any) => ({
        texto: item.texto || item,
        concluido: false
      }));
    }
  }

  const task = await Task.create(
    {
      title,
      description,
      contactId: contactId ? parseInt(contactId.toString()) : null,
      ticketId: ticketId ? parseInt(ticketId.toString()) : null,
      companyId: parseInt(companyId.toString()),
      userId: finalUserId,
      createdBy: finalCreatedBy,
      status: finalStatus,
      dueDate: dueDate || null,
      tarefaConfigId: tarefaConfigId ? parseInt(tarefaConfigId.toString()) : null,
      prioridadeId: prioridadeId ? parseInt(prioridadeId.toString()) : null,
      clienteId: clienteId ? parseInt(clienteId.toString()) : null,
      departamentoId: departamentoId ? parseInt(departamentoId.toString()) : null,
      dataHoraCriacao: dataHoraCriacao || new Date(),
      checklistProgresso: checklistInicial,
      valor: valor ? parseFloat(valor.toString()) : null
    }
  );

  await task.reload();

  // Registrar no histórico apenas se houver userId válido
  if (finalUserId && finalCreatedBy) {
    try {
      await TaskHistory.create({
        taskId: task.id,
        toUserId: finalUserId,
        actionType: "created",
        newValue: JSON.stringify({
          title,
          description,
          status: status || "Pendente",
          userId: finalUserId
        }),
        performedBy: finalCreatedBy,
        companyId: parseInt(companyId.toString())
      });
    } catch (historyError) {
      console.error("Erro ao criar histórico da tarefa:", historyError);
      // Não falha a criação da tarefa se o histórico falhar
    }
  }

  return task;
};

export default CreateService;
