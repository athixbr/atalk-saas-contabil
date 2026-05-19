import __cjs_sequelize from "sequelize";
const { Op, fn, col } = __cjs_sequelize;
import ControleCliente from "../../models/ControleCliente";
import ControleConfig from "../../models/ControleConfig";
import Cliente from "../../models/Cliente";
import Departamento from "../../models/Departamento";
import User from "../../models/User";

interface FiltrosListagem {
  companyId: number;
  controleConfigId?: number;
  clienteId?: number;
  departamentoId?: number;
  usuarioId?: number;
  ativo?: boolean;
  dataInicioMin?: Date;
  dataInicioMax?: Date;
  dataFimMin?: Date;
  dataFimMax?: Date;
  searchParam?: string;
  pageNumber?: number;
  pageSize?: number;
}

interface ResultadoListagem {
  vinculos: ControleCliente[];
  count: number;
  hasMore: boolean;
}

const ListarVinculosService = async (
  filtros: FiltrosListagem
): Promise<ResultadoListagem> => {
  const {
    companyId,
    controleConfigId,
    clienteId,
    departamentoId,
    usuarioId,
    ativo,
    dataInicioMin,
    dataInicioMax,
    dataFimMin,
    dataFimMax,
    searchParam,
    pageNumber = 1,
    pageSize = 20,
  } = filtros;

  const whereCondition: any = {};

  // Filtros básicos
  if (controleConfigId) {
    whereCondition.controleConfigId = controleConfigId;
  }

  if (clienteId) {
    whereCondition.clienteId = clienteId;
  }

  if (departamentoId) {
    whereCondition.departamentoId = departamentoId;
  }

  if (usuarioId) {
    whereCondition.usuarioId = usuarioId;
  }

  if (ativo !== undefined) {
    whereCondition.ativo = ativo;
  }

  // Filtros de data
  if (dataInicioMin || dataInicioMax) {
    whereCondition.dataInicio = {};
    if (dataInicioMin) {
      whereCondition.dataInicio[Op.gte] = dataInicioMin;
    }
    if (dataInicioMax) {
      whereCondition.dataInicio[Op.lte] = dataInicioMax;
    }
  }

  if (dataFimMin || dataFimMax) {
    whereCondition.dataFim = {};
    if (dataFimMin) {
      whereCondition.dataFim[Op.gte] = dataFimMin;
    }
    if (dataFimMax) {
      whereCondition.dataFim[Op.lte] = dataFimMax;
    }
  }

  // Paginação
  const limit = pageSize;
  const offset = (pageNumber - 1) * pageSize;

  // Incluir associações
  const include: any[] = [
    {
      model: ControleConfig,
      as: "controleConfig",
      required: true,
      where: { companyId },
      include: [
        { model: Departamento, as: "departamento" },
      ],
    },
    {
      model: Cliente,
      as: "cliente",
      required: true,
      where: searchParam
        ? {
            nome: {
              [Op.iLike]: `%${searchParam}%`,
            },
          }
        : undefined,
    },
    {
      model: Departamento,
      as: "departamento",
      required: false,
    },
    {
      model: User,
      as: "usuario",
      required: false,
      attributes: ["id", "name", "email"],
    },
  ];

  // Buscar vínculos
  const { count, rows: vinculos } = await ControleCliente.findAndCountAll({
    where: whereCondition,
    include,
    limit,
    offset,
    order: [
      ["ativo", "DESC"],
      ["dataInicio", "DESC"],
      ["id", "DESC"],
    ],
    distinct: true,
  });

  const hasMore = count > offset + vinculos.length;

  return {
    vinculos,
    count,
    hasMore,
  };
};

export default ListarVinculosService;
