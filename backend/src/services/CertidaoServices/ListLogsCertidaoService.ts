import LogCertidao from "../../models/LogCertidao";
import ClienteCertidao from "../../models/ClienteCertidao";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface ListLogsParams {
  certidaoId?: number;
  clienteCertidaoId?: number;
  companyId: number;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}

interface ListLogsResponse {
  logs: LogCertidao[];
  count: number;
  hasMore: boolean;
}

const ListLogsCertidaoService = async (params: ListLogsParams): Promise<ListLogsResponse> => {
  const {
    certidaoId,
    clienteCertidaoId,
    companyId,
    status,
    pageNumber = 1,
    pageSize = 20
  } = params;

  const whereCondition: any = {
    companyId
  };

  if (certidaoId) {
    whereCondition.certidaoId = certidaoId;
  }

  if (clienteCertidaoId) {
    whereCondition.clienteCertidaoId = clienteCertidaoId;
  }

  if (status) {
    whereCondition.status = status;
  }

  const offset = (pageNumber - 1) * pageSize;

  const { count, rows: logs } = await LogCertidao.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: ClienteCertidao,
        as: "clienteCertidao",
        attributes: ["id", "nome", "tipoCliente", "cpf", "cnpj"]
      }
    ],
    order: [["createdAt", "DESC"]],
    limit: pageSize,
    offset
  });

  const hasMore = count > offset + logs.length;

  return {
    logs,
    count,
    hasMore
  };
};

export default ListLogsCertidaoService;
