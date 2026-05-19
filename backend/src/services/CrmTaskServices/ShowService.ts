import CrmTask from "../../models/CrmTask";
import User from "../../models/User";
import CrmTaskCategory from "../../models/CrmTaskCategory";
import CrmLead from "../../models/CrmLead";
import AppError from "../../errors/AppError";

const ShowService = async (id: string, companyId: number): Promise<CrmTask> => {
  const task = await CrmTask.findOne({
    where: { id, companyId },
    include: [
      { model: User, as: "user", attributes: ["id", "name", "email"] },
      { model: CrmTaskCategory, as: "category" },
      { model: CrmLead, as: "lead" }
    ]
  });

  if (!task) {
    throw new AppError("ERR_NO_CRM_TASK_FOUND", 404);
  }

  return task;
};

export default ShowService;
