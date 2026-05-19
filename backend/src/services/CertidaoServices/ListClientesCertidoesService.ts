import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import ClienteCertidao from "../../models/ClienteCertidao";
import AppError from "../../errors/AppError";

interface Request {
  searchParam?: string;
  pageNumber?: number;
  companyId: number;
}

interface Response {
  clientes: ClienteCertidao[];
  count: number;
  hasMore: boolean;
}

const ListClientesCertidoesService = async ({
  searchParam = "",
  pageNumber = 1,
  companyId
}: Request): Promise<Response> => {
  const whereCondition: any = {
    companyId,
    ativo: true
  };

  if (searchParam) {
    whereCondition[Op.or] = [
      { nome: { [Op.like]: `%${searchParam}%` } },
      { cpf: { [Op.like]: `%${searchParam}%` } },
      { cnpj: { [Op.like]: `%${searchParam}%` } },
      { razaoSocial: { [Op.like]: `%${searchParam}%` } }
    ];
  }

  const limit = 20;
  const offset = limit * (pageNumber - 1);

  const { count, rows: clientes } = await ClienteCertidao.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["nome", "ASC"]]
  });

  const hasMore = count > offset + clientes.length;

  return {
    clientes,
    count,
    hasMore
  };
};

export default ListClientesCertidoesService;
