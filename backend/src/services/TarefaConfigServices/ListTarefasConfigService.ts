import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import TarefaConfig from "../../models/TarefaConfig";
import TarefaConfigChecklist from "../../models/TarefaConfigChecklist";
import Departamento from "../../models/Departamento";
import Status from "../../models/Status";
import Prazo from "../../models/Prazo";

interface Request {
  companyId: number;
  searchParam?: string;
  departamentoId?: number;
  ativo?: boolean;
  page?: number;
  limit?: number;
}

interface Response {
  tarefas: TarefaConfig[];
  count: number;
  hasMore: boolean;
}

const ListTarefasConfigService = async ({
  companyId,
  searchParam = "",
  departamentoId,
  ativo,
  page = 1,
  limit = 10,
}: Request): Promise<Response> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition[Op.or] = [
      {
        titulo: {
          [Op.iLike]: `%${searchParam}%`,
        },
      },
      {
        descricao: {
          [Op.iLike]: `%${searchParam}%`,
        },
      },
    ];
  }

  if (departamentoId) {
    whereCondition.departamentoId = departamentoId;
  }

  if (ativo !== undefined) {
    whereCondition.ativo = ativo;
  }

  const offset = (page - 1) * limit;

  const { count, rows: tarefas } = await TarefaConfig.findAndCountAll({
    where: whereCondition,
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
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  const hasMore = count > offset + tarefas.length;

  return {
    tarefas,
    count,
    hasMore,
  };
};

export default ListTarefasConfigService;
