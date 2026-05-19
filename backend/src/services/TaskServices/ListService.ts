import __cjs_sequelize from "sequelize";
const { Op, col, where, fn } = __cjs_sequelize;
import Contact from "../../models/Contact";
import Task from "../../models/Task";
import User from "../../models/User";
import Ticket from "../../models/Ticket";
import TarefaConfig from "../../models/TarefaConfig";
import TarefaConfigChecklist from "../../models/TarefaConfigChecklist";
import Prioridade from "../../models/Prioridade";
import Cliente from "../../models/Cliente";
import Departamento from "../../models/Departamento";
import DepartamentoUsuario from "../../models/DepartamentoUsuario";
import Prazo from "../../models/Prazo";
import TarefaGerada from "../../models/TarefaGerada";
import ControleCliente from "../../models/ControleCliente";
import ControleConfig from "../../models/ControleConfig";

interface ListServiceRequest {
  searchParam?: string;
  contactId?: number | string;
  userId?: number | string;
  status?: string;
  excludeStatus?: string;
  filterPeriod?: string;
  companyId?: number;
  pageNumber?: string | number;
  profile?: string;
  requestUserId?: number | string;
  clienteId?: string;
  prioridadeId?: string;
  departamentoId?: string;
  prazoId?: string;
  tipo?: string; // 'todas' | 'tarefa' | 'controle'
}

interface Response {
  tasks: Task[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  searchParam,
  contactId = "",
  userId = "",
  status = "",
  excludeStatus = "",
  filterPeriod = "",
  pageNumber = "1",
  companyId,
  profile,
  requestUserId,
  clienteId = "",
  prioridadeId = "",
  departamentoId = "",
  prazoId = "",
  tipo = "todas" // Novo filtro
}: ListServiceRequest): Promise<Response> => {
  let whereCondition = {};
  const limit = 12;
  const offset = limit * (+pageNumber - 1);

  // Buscar departamentos do usuário se não for admin
  let userDepartmentIds: number[] = [];
  if (profile !== "admin" && requestUserId) {
    const departamentosUsuario = await DepartamentoUsuario.findAll({
      where: { userId: typeof requestUserId === 'string' ? parseInt(requestUserId) : requestUserId },
      attributes: ['departamentoId']
    });
    userDepartmentIds = departamentosUsuario.map(du => du.departamentoId);
    console.log(`Usuário ${requestUserId} pertence aos departamentos:`, userDepartmentIds);
  }

  // Lógica de permissões:
  // - Admin: pode ver todas as tarefas ou filtrar por usuários específicos
  // - Não-admin: vê tarefas próprias OU tarefas dos seus departamentos
  if (profile !== "admin") {
    // Usuário comum: filtra por suas tarefas OU tarefas do seu departamento
    const userIdParsed = typeof requestUserId === 'string' ? parseInt(requestUserId) : requestUserId;
    
    if (userDepartmentIds.length > 0) {
      // Tem departamentos: mostra suas tarefas OU tarefas dos departamentos
      whereCondition = {
        [Op.or]: [
          { userId: userIdParsed },
          { departamentoId: { [Op.in]: userDepartmentIds } }
        ]
      };
    } else {
      // Não tem departamentos: só suas tarefas
      whereCondition = {
        userId: userIdParsed
      };
    }
  } else if (userId !== "") {
    // Admin pode filtrar por usuários específicos
    const userIds = userId.toString().split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    if (userIds.length > 1) {
      whereCondition = {
        ...whereCondition,
        userId: {
          [Op.in]: userIds
        }
      };
    } else if (userIds.length === 1) {
      whereCondition = {
        ...whereCondition,
        userId: userIds[0]
      };
    }
  }
  // Se admin e userId vazio, mostra todas as tarefas (sem filtro de userId)

  if (searchParam) {
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        {
          "$Task.title$": where(
            fn("LOWER", col("Task.title")),
            "LIKE",
            `%${searchParam.toLowerCase()}%`
          )
        },
        {
          "$Task.description$": where(
            fn("LOWER", col("Task.description")),
            "LIKE",
            `%${searchParam.toLowerCase()}%`
          )
        },
        {
          "$contact.name$": where(
            fn("LOWER", fn("unaccent", col("contact.name"))),
            "LIKE",
            `%${searchParam.toLowerCase()}%`
          )
        },
        {
          "$cliente.nomeFantasia$": where(
            fn("LOWER", fn("unaccent", col("cliente.nomeFantasia"))),
            "LIKE",
            `%${searchParam.toLowerCase()}%`
          )
        },
        {
          "$cliente.razaoSocial$": where(
            fn("LOWER", fn("unaccent", col("cliente.razaoSocial"))),
            "LIKE",
            `%${searchParam.toLowerCase()}%`
          )
        },
        {
          "$tarefaConfig.titulo$": where(
            fn("LOWER", col("tarefaConfig.titulo")),
            "LIKE",
            `%${searchParam.toLowerCase()}%`
          )
        }
      ],
    }
  }

  if (contactId !== "") {
    whereCondition = {
      ...whereCondition,
      contactId
    }
  }

  // Filtro de Cliente - suporta múltiplos valores
  if (clienteId !== "") {
    const clienteIds = clienteId.toString().split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    if (clienteIds.length > 1) {
      whereCondition = {
        ...whereCondition,
        clienteId: {
          [Op.in]: clienteIds
        }
      };
    } else if (clienteIds.length === 1) {
      whereCondition = {
        ...whereCondition,
        clienteId: clienteIds[0]
      };
    }
  }

  // Filtro de Prioridade - suporta múltiplos valores
  if (prioridadeId !== "") {
    const prioridadeIds = prioridadeId.toString().split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    if (prioridadeIds.length > 1) {
      whereCondition = {
        ...whereCondition,
        prioridadeId: {
          [Op.in]: prioridadeIds
        }
      };
    } else if (prioridadeIds.length === 1) {
      whereCondition = {
        ...whereCondition,
        prioridadeId: prioridadeIds[0]
      };
    }
  }

  // Filtro de Departamento - suporta múltiplos valores
  if (departamentoId !== "") {
    const departamentoIds = departamentoId.toString().split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    if (departamentoIds.length > 1) {
      whereCondition = {
        ...whereCondition,
        departamentoId: {
          [Op.in]: departamentoIds
        }
      };
    } else if (departamentoIds.length === 1) {
      whereCondition = {
        ...whereCondition,
        departamentoId: departamentoIds[0]
      };
    }
  }

  // Filtro de Prazo - suporta múltiplos valores (filtro baseado na TarefaConfig.prazoId)
  // Filtra pela relação Task -> TarefaConfig -> prazoId
  let prazoWhereCondition = {};
  if (prazoId !== "") {
    const prazoIds = prazoId.toString().split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    if (prazoIds.length > 1) {
      prazoWhereCondition = {
        prazoId: {
          [Op.in]: prazoIds
        }
      };
    } else if (prazoIds.length === 1) {
      prazoWhereCondition = {
        prazoId: prazoIds[0]
      };
    }
  }

  // Status filter: accept single status, comma-separated string, or JSON array string
  if (status !== "") {
    // Tenta parsear como JSON primeiro
    try {
      const parsed = JSON.parse(status as unknown as string);
      if (Array.isArray(parsed)) {
        whereCondition = {
          ...whereCondition,
          status: {
            [Op.in]: parsed
          }
        };
      } else {
        whereCondition = {
          ...whereCondition,
          status: parsed
        };
      }
    } catch (err) {
      // Não é JSON, verifica se é string separada por vírgula
      if (status.includes(',')) {
        const statusArray = status.split(',').map(s => s.trim()).filter(s => s);
        whereCondition = {
          ...whereCondition,
          status: {
            [Op.in]: statusArray
          }
        };
      } else {
        // String simples
        whereCondition = {
          ...whereCondition,
          status
        };
      }
    }
  }

  // Exclude Status filter: exclui status específico (ex: Concluída)
  // Mapear status com maiúscula para minúscula para TarefasGeradas
  const mapStatusToLower = (statusStr: string) => {
    const mapping: Record<string, string> = {
      'Pendente': 'pendente',
      'Em Andamento': 'em_andamento',
      'Concluída': 'concluida',
      'Cancelada': 'cancelada'
    };
    return mapping[statusStr] || statusStr.toLowerCase().replace(/ /g, '_');
  };

  if (excludeStatus !== "") {
    if (excludeStatus.includes(',')) {
      const excludeStatusArray = excludeStatus.split(',').map(s => s.trim()).filter(s => s);
      whereCondition = {
        ...whereCondition,
        status: {
          [Op.notIn]: excludeStatusArray
        }
      };
    } else {
      whereCondition = {
        ...whereCondition,
        status: {
          [Op.ne]: excludeStatus
        }
      };
    }
  }
  // REMOVIDO: Não excluir por padrão se nenhum filtro de status for especificado
  // Isso permite que o checkbox "Mostrar tarefas concluídas" funcione corretamente

  // Filtro de período
  if (filterPeriod !== "") {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    switch (filterPeriod) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        whereCondition = {
          ...whereCondition,
          dueDate: {
            [Op.between]: [startDate, endDate]
          }
        };
        break;
      case "week":
        endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);
        whereCondition = {
          ...whereCondition,
          dueDate: {
            [Op.lte]: endDate
          }
        };
        break;
      case "month":
        endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        whereCondition = {
          ...whereCondition,
          dueDate: {
            [Op.lte]: endDate
          }
        };
        break;
      case "overdue":
        whereCondition = {
          ...whereCondition,
          dueDate: {
            [Op.lt]: new Date()
          },
          status: {
            [Op.notIn]: ["Concluída", "Cancelada"]
          }
        };
        break;
    }
  }

  whereCondition = {
    ...whereCondition,
    companyId: {
      [Op.eq]: companyId
    },
    deletedAt: null  // Apenas tarefas não deletadas
  }

  // Se tipo='controle', busca apenas TarefasGeradas
  // Se tipo='tarefa', busca apenas Tasks
  // Se tipo='todas', busca ambas e mescla
  
  let tasks: any[] = [];
  let count = 0;

  if (tipo === "controle" || tipo === "todas") {
    // Buscar TarefasGeradas
    const whereConditionGeradas: any = { ...whereCondition };
    delete whereConditionGeradas['deletedAt']; // TarefasGeradas não tem deletedAt
    
    // Mapear status para o enum correto de TarefasGeradas
    if (whereConditionGeradas.status) {
      const mapStatusToLower = (statusValue: any): any => {
        const mapping: Record<string, string> = {
          'Pendente': 'pendente',
          'Em Andamento': 'em_andamento',
          'Concluída': 'concluida',
          'Cancelada': 'cancelada'
        };
        
        if (typeof statusValue === 'string') {
          return mapping[statusValue] || statusValue;
        } else if (typeof statusValue === 'object' && statusValue[Op.in]) {
          return { [Op.in]: statusValue[Op.in].map((s: string) => mapping[s] || s) };
        } else if (typeof statusValue === 'object' && statusValue[Op.notIn]) {
          return { [Op.notIn]: statusValue[Op.notIn].map((s: string) => mapping[s] || s) };
        } else if (typeof statusValue === 'object' && statusValue[Op.ne]) {
          return { [Op.ne]: mapping[statusValue[Op.ne]] || statusValue[Op.ne] };
        }
        return statusValue;
      };
      
      whereConditionGeradas.status = mapStatusToLower(whereConditionGeradas.status);
    }
    
    const { count: countGeradas, rows: tarefasGeradas } = await TarefaGerada.findAndCountAll({
      where: whereConditionGeradas,
      limit: tipo === "controle" ? limit : undefined,
      offset: tipo === "controle" ? offset : undefined,
      order: [["dataEntrega", "ASC"], ["createdAt", "DESC"]],
      include: [
        { model: User, as: "user", attributes: ["id", "name"] },
        { model: Cliente, as: "cliente", attributes: ["id", "nomeFantasia", "razaoSocial", "codigoErp"] },
        { model: Departamento, as: "departamento", attributes: ["id", "nome"] },
        { 
          model: ControleCliente, 
          as: "controleCliente",
          attributes: ["id", "ativo", "dataInicio", "dataFim"],
          include: [
            {
              model: ControleConfig,
              as: "controleConfig",
              attributes: ["id", "codigo", "nome", "recorrente"]
            }
          ]
        }
      ]
    });

    // Mapear TarefasGeradas para o formato de Task
    const tarefasGeradasMapeadas = tarefasGeradas.map((tg: any) => ({
      ...tg.toJSON(),
      title: tg.titulo,
      description: tg.descricao,
      dueDate: tg.dataEntrega,
      contact: null,
      ticket: null,
      tarefaConfig: null,
      prioridade: null,
      creator: null,
      origem: "controle" // Marca como controle
    }));

    tasks = tasks.concat(tarefasGeradasMapeadas);
    count += countGeradas;
  }

  if (tipo === "tarefa" || tipo === "todas") {
    // Buscar Tasks normais
    const { count: countTasks, rows: taskRows } = await Task.findAndCountAll({
      where: whereCondition,
      limit: tipo === "tarefa" ? limit : undefined,
      offset: tipo === "tarefa" ? offset : undefined,
      order: [["dueDate", "ASC"], ["createdAt", "DESC"]],
      include: [
        { model: Contact, as: "contact", attributes: ["id", "name"] },
        { model: User, as: "user", attributes: ["id", "name"] },
        { model: User, as: "creator", attributes: ["id", "name", "email"] },
        { model: Ticket, as: "ticket", attributes: ["id"] },
        { 
          model: TarefaConfig, 
          as: "tarefaConfig", 
          attributes: ["id", "titulo", "descricao", "prazoId"],
          where: Object.keys(prazoWhereCondition).length > 0 ? prazoWhereCondition : undefined,
          required: Object.keys(prazoWhereCondition).length > 0,
          include: [
            { 
              model: TarefaConfigChecklist, 
              as: "checklist",
              attributes: ["id", "text", "order", "image"]
            },
            {
              model: Prazo,
              as: "prazo",
              attributes: ["id", "nome", "cor"]
            }
          ]
        },
        { model: Prioridade, as: "prioridade", attributes: ["id", "nome", "cor"] },
        { model: Cliente, as: "cliente", attributes: ["id", "nomeFantasia", "razaoSocial", "codigoErp"] },
        { model: Departamento, as: "departamento", attributes: ["id", "nome"] }
      ]
    });

    const tasksMapeadas = taskRows.map((t: any) => ({
      ...t.toJSON(),
      origem: "tarefa" // Marca como tarefa manual
    }));

    tasks = tasks.concat(tasksMapeadas);
    count += countTasks;
  }

  // Se tipo='todas', ordenar tudo junto
  if (tipo === "todas") {
    tasks = tasks.sort((a, b) => {
      const dateA = new Date(a.dueDate || a.dataEntrega).getTime();
      const dateB = new Date(b.dueDate || b.dataEntrega).getTime();
      return dateA - dateB;
    });
    
    // Aplicar paginação manual
    tasks = tasks.slice(offset, offset + limit);
  }

  const hasMore = count > offset + tasks.length;

  return {
    tasks,
    count,
    hasMore
  };
};

export default ListService;
