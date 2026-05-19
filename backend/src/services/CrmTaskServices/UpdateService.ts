import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmTask from "../../models/CrmTask";
import { addMonths, addYears, startOfDay } from "date-fns";

interface Request {
  id: string;
  companyId: number;
  title?: string;
  description?: string;
  categoryId?: number | string;
  stageId?: number | string;
  userId?: number | string;
  dueDate?: Date | string;
  status?: string;
  priority?: string;
  completedAt?: Date | string;
  recurrence?: string;
  reminderDays?: number | string;
}

const UpdateService = async (data: Request): Promise<CrmTask> => {
  const { id, companyId } = data;

  const task = await CrmTask.findOne({
    where: { id, companyId }
  });

  if (!task) {
    throw new AppError("ERR_NO_CRM_TASK_FOUND", 404);
  }

  // Limpar e converter valores vazios para null
  const cleanData: any = {};
  
  if (data.title !== undefined) cleanData.title = data.title;
  if (data.description !== undefined) cleanData.description = data.description || null;
  if (data.categoryId !== undefined) {
    cleanData.categoryId = data.categoryId && data.categoryId !== "" ? parseInt(String(data.categoryId)) : null;
  }
  if (data.stageId !== undefined) {
    cleanData.stageId = data.stageId && data.stageId !== "" ? parseInt(String(data.stageId)) : null;
  }
  if (data.userId !== undefined) {
    cleanData.userId = data.userId && data.userId !== "" ? parseInt(String(data.userId)) : null;
  }
  if (data.reminderDays !== undefined) {
    cleanData.reminderDays = data.reminderDays && data.reminderDays !== "" ? parseInt(String(data.reminderDays)) : null;
  }
  if (data.dueDate !== undefined) {
    cleanData.dueDate = data.dueDate && !isNaN(new Date(data.dueDate).getTime()) ? data.dueDate : null;
  }
  if (data.status !== undefined) cleanData.status = data.status;
  if (data.priority !== undefined) cleanData.priority = data.priority;
  if (data.recurrence !== undefined) cleanData.recurrence = data.recurrence || null;
  if (data.completedAt !== undefined) cleanData.completedAt = data.completedAt;

  // Se status mudar para completed e não tiver completedAt, seta agora
  if (cleanData.status === "completed" && !task.completedAt && !cleanData.completedAt) {
    cleanData.completedAt = new Date();
  }

  // Recalcular nextOccurrence se recorrência ou dueDate mudarem
  if ((cleanData.recurrence !== undefined || cleanData.dueDate !== undefined) && task.recurrence) {
    const recurrence = cleanData.recurrence !== undefined ? cleanData.recurrence : task.recurrence;
    const dueDate = cleanData.dueDate !== undefined ? new Date(cleanData.dueDate) : task.dueDate;
    
    if (recurrence && dueDate) {
      const baseDate = startOfDay(dueDate);
      let nextOccurrence = null;
      
      switch (recurrence) {
        case "monthly":
          nextOccurrence = addMonths(baseDate, 1);
          break;
        case "quarterly":
          nextOccurrence = addMonths(baseDate, 3);
          break;
        case "semiannual":
          nextOccurrence = addMonths(baseDate, 6);
          break;
        case "annual":
          nextOccurrence = addYears(baseDate, 1);
          break;
      }
      
      cleanData['nextOccurrence'] = nextOccurrence;
    }
  }

  await task.update(cleanData);

  await task.reload({
    include: [
      { association: "user" },
      { association: "category" },
      { association: "stage" },
      { association: "lead" },
      { association: "cliente" }
    ]
  });

  return task;
};

export default UpdateService;
