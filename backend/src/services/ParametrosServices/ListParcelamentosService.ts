import Parcelamentos from "../../models/Parcelamentos";
import Cliente from "../../models/Cliente";
import Departamento from "../../models/Departamento";
import User from "../../models/User";
import TarefaConfig from "../../models/TarefaConfig";
import ParcelamentosParcela from "../../models/ParcelamentosParcela";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  companyId: number;
  searchParam?: string;
  page?: number;
  limit?: number;
  status?: string;
}

interface Response {
  records: Parcelamentos[];
  count: number;
  hasMore: boolean;
}

const ListParcelamentosService = async ({
  companyId,
  searchParam = "",
  page = 1,
  limit = 20,
  status,
}: Request): Promise<Response> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition[Op.or] = [
      { nome: { [Op.like]: `%${searchParam}%` } },
      { descricao: { [Op.like]: `%${searchParam}%` } },
    ];
  }

  if (status) {
    whereCondition.status = status;
  }

  const offset = (page - 1) * limit;

  const { count, rows: parcelamentos } = await Parcelamentos.findAndCountAll({
    where: whereCondition,
    include: [
      { model: Cliente, as: "cliente", attributes: ["id", "nome", "cpf", "cnpj"] },
      { model: Departamento, as: "departamento", attributes: ["id", "nome"] },
      { model: User, as: "responsavel", attributes: ["id", "name"] },
      { model: TarefaConfig, as: "tarefaConfig", attributes: ["id", "titulo"] },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  // Para cada parcelamento, contar parcelas pagas
  const parcelamentosComParcelas = await Promise.all(
    parcelamentos.map(async (p) => {
      const totalParcelas = await ParcelamentosParcela.count({
        where: { parcelamentoId: p.id },
      });

      const parcelasPagas = await ParcelamentosParcela.count({
        where: { parcelamentoId: p.id, status: "pago" },
      });

      return {
        ...p.toJSON(),
        totalParcelas,
        parcelasPagas,
      };
    })
  );

  return {
    records: parcelamentosComParcelas as any,
    count,
    hasMore: offset + limit < count,
  };
};

export default ListParcelamentosService;
