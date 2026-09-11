import CrmTask from "../../models/CrmTask";
import User from "../../models/User";
import CrmTaskCategory from "../../models/CrmTaskCategory";
import CrmTaskStage from "../../models/CrmTaskStage";
import CrmLead from "../../models/CrmLead";
import Cliente from "../../models/Cliente";

interface Request {
  companyId: number;
  leadId?: number | string;
  clienteId?: number | string;
  userId?: number | string;
  categoryId?: number | string;
  status?: string;
  priority?: string;
}

const ListService = async ({
  companyId,
  leadId,
  clienteId,
  userId,
  categoryId,
  status,
  priority
}: Request): Promise<CrmTask[]> => {
  const whereCondition: any = { companyId };

  if (leadId) {
    whereCondition.leadId = leadId;
  }

  if (clienteId) {
    whereCondition.clienteId = clienteId;
  }

  if (userId) {
    whereCondition.userId = userId;
  }

  if (categoryId) {
    whereCondition.categoryId = categoryId;
  }

  if (status) {
    whereCondition.status = status;
  }

  if (priority) {
    whereCondition.priority = priority;
  }

  const tasks = await CrmTask.findAll({
    where: whereCondition,
    include: [
      { model: User, as: "user", attributes: ["id", "name", "email"] },
      { model: CrmTaskCategory, as: "category" },
      { model: CrmTaskStage, as: "stage" },
      { model: CrmLead, as: "lead", attributes: ["id", "name"] },
      { model: Cliente, as: "cliente", attributes: ["id", "nome", "razaoSocial", "nomeFantasia"] }
    ],
    order: [["dueDate", "ASC"]]
  });

  return tasks;
};

export default ListService;
