import CrmTask from "../../models/CrmTask";
import AppError from "../../errors/AppError";

const DeleteService = async (id: string, companyId: number): Promise<void> => {
  const task = await CrmTask.findOne({
    where: { id, companyId }
  });

  if (!task) {
    throw new AppError("ERR_NO_CRM_TASK_FOUND", 404);
  }

  await task.destroy();
};

export default DeleteService;
