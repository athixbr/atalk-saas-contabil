import TarefaConfig from "../../models/TarefaConfig";
import TarefaConfigChecklist from "../../models/TarefaConfigChecklist";
import Departamento from "../../models/Departamento";
import Status from "../../models/Status";
import Prazo from "../../models/Prazo";
import AppError from "../../errors/AppError";

interface Request {
  id: string | number;
  companyId: number;
}

const ShowTarefaConfigService = async ({
  id,
  companyId,
}: Request): Promise<TarefaConfig> => {
  const tarefa = await TarefaConfig.findOne({
    where: { id, companyId },
    include: [
      {
        model: Departamento,
        as: "departamento",
        attributes: ["id", "nome"],
      },
      {
        model: Status,
        as: "status",
        attributes: ["id", "nome", "cor"],
      },
      {
        model: Prazo,
        as: "prazo",
        attributes: ["id", "nome", "cor"],
      },
      {
        model: TarefaConfigChecklist,
        as: "checklist",
        attributes: ["id", "text", "order", "image"],
        separate: true,
        order: [["order", "ASC"]],
      },
    ],
  });

  if (!tarefa) {
    throw new AppError("Tarefa não encontrada", 404);
  }

  return tarefa;
};

export default ShowTarefaConfigService;
