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
  orderBy?: string;
  order?: string;
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
  searchParam = "",
  orderBy = "createdAt",
  order = "DESC"
}: Request): Promise<Response> => {
  const offset = (page - 1) * pageSize;
  const limit = pageSize;

  const whereCondition: any = {
    companyId
  };

  if (searchParam) {
    const searchConditions: any[] = [
      { nomeTarefa: { [Op.like]: `%${searchParam}%` } },
      { tipoTarefa: { [Op.like]: `%${searchParam}%` } },
      { mininome: { [Op.like]: `%${searchParam}%` } }
    ];
    if (/^\d+$/.test(String(searchParam))) {
      searchConditions.push({ id: Number(searchParam) });
    }
    whereCondition[Op.or] = searchConditions;
  }

  const orderMap: Record<string, any> = {
    codigo: ["id"],
    nomeTarefa: ["nomeTarefa"],
    tipoTarefa: ["tipoTarefa"],
    classificacao: ["classificacao"],
    mininome: ["mininome"],
    esfera: ["esfera"],
    valor: ["valor"],
    checklistObrigatorio: ["checklistObrigatorio"],
    sabadoUtil: ["sabadoUtil"],
    exigirRobo: ["exigirRobo"],
    passivelMulta: ["passivelMulta"],
    alertaGuia: ["alertaGuia"],
    notificarCliente: ["notificarCliente"],
    servicoLiberado: ["servicoLiberado"],
    baixarAutomatico: ["baixarAutomatico"],
    status: ["ativa"],
    createdAt: ["createdAt"],
    updatedAt: ["updatedAt"],
    departamento: [{ model: Departamento, as: "departamento" }, "nome"],
    usuarioResponsavel: [{ model: User, as: "usuarioResponsavel" }, "name"]
  };
  const safeOrderBy = orderMap[orderBy] || orderMap.createdAt;
  const safeOrder = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";

  const orderClause = [[...safeOrderBy, safeOrder]] as any;

  const { count, rows: tarefas } = await TarefaRecorrente.findAndCountAll({
    where: whereCondition,
    attributes: {
      exclude: ["diasConclusao"]
    },
    distinct: true,
    col: "id",
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
    order: orderClause
  });

  const hasMore = count > offset + tarefas.length;
  tarefas.forEach(tarefa => tarefa.setDataValue("codigo", String(tarefa.id)));

  return {
    tarefas,
    count,
    hasMore
  };
};

export default ListTarefasRecorrentesService;
