import TarefaRecorrente from "../../models/TarefaRecorrente";
import Cliente from "../../models/Cliente";
import Socio from "../../models/Socio";
import Departamento from "../../models/Departamento";
import User from "../../models/User";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  page?: number;
  pageSize?: number;
  searchParam?: string;
}

interface Response {
  tarefas: TarefaRecorrente[];
  count: number;
  hasMore: boolean;
}

const ListTarefasRecorrentesService = async ({
  companyId,
  page = 1,
  pageSize = 20,
  searchParam = ""
}: Request): Promise<Response> => {
  const offset = (page - 1) * pageSize;
  const limit = pageSize;

  const whereCondition: any = {
    companyId
  };

  if (searchParam) {
    whereCondition[Op.or] = [
      { nomeTarefa: { [Op.like]: `%${searchParam}%` } },
      { codigo: { [Op.like]: `%${searchParam}%` } },
      { mininome: { [Op.like]: `%${searchParam}%` } }
    ];
  }

  const { count, rows: tarefas } = await TarefaRecorrente.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: Departamento,
        as: "departamento",
        attributes: ["id", "nome"]
      },
      {
        model: User,
        as: "usuarioResponsavel",
        attributes: ["id", "name", "email"]
      },
      {
        model: Cliente,
        as: "clientes",
        attributes: ["id", "nome", "cpf", "cnpj", "codigoErp"],
        through: { attributes: [] }
      },
      {
        model: Socio,
        as: "socios",
        attributes: ["id", "nome", "cpf"],
        through: { attributes: [] }
      },
      {
        model: User,
        as: "usuarios",
        attributes: ["id", "name", "email"],
        through: { attributes: [] }
      }
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]]
  });

  const hasMore = count > offset + tarefas.length;

  return {
    tarefas,
    count,
    hasMore
  };
};

export default ListTarefasRecorrentesService;
