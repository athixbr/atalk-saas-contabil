import TarefaConfig from "../../models/TarefaConfig";
import AppError from "../../errors/AppError";
import { deleteAllChecklistImages } from "../../helpers/ChecklistImageHelper";

interface Request {
  tarefaConfigId: number;
  companyId: number;
}

const DeleteTarefaConfigService = async ({
  tarefaConfigId,
  companyId,
}: Request): Promise<void> => {
  const tarefa = await TarefaConfig.findOne({
    where: { id: tarefaConfigId, companyId },
  });

  if (!tarefa) {
    throw new AppError("Tarefa não encontrada", 404);
  }

  // Deletar imagens do checklist
  await deleteAllChecklistImages(companyId, tarefaConfigId);

  await tarefa.destroy();
};

export default DeleteTarefaConfigService;
