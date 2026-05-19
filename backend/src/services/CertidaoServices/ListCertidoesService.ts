import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import Certidao from "../../models/Certidao";
import Cliente from "../../models/Cliente";

interface Request {
  companyId: number;
  tipo?: string;
  categoria?: string;
  searchParam?: string;
  pageNumber?: number;
}

interface Response {
  certidoes: Certidao[];
  count: number;
  hasMore: boolean;
}

const ListCertidoesService = async ({
  companyId,
  tipo,
  categoria,
  searchParam = "",
  pageNumber = 1
}: Request): Promise<Response> => {
  const whereCondition: any = { companyId };

  if (tipo) {
    whereCondition.tipo = tipo;
  }

  if (categoria) {
    whereCondition.categoria = categoria;
  }

  const limit = 20;
  const offset = limit * (pageNumber - 1);

  const { count, rows: certidoes } = await Certidao.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: Cliente,
        as: "cliente",
        required: false,
        where: searchParam
          ? {
              [Op.or]: [
                { nome: { [Op.like]: `%${searchParam}%` } },
                { cpf: { [Op.like]: `%${searchParam}%` } },
                { cnpj: { [Op.like]: `%${searchParam}%` } }
              ]
            }
          : undefined
      }
    ],
    limit,
    offset,
    order: [["dataConsulta", "DESC"]]
  });

  const hasMore = count > offset + certidoes.length;

  return {
    certidoes,
    count,
    hasMore
  };
};

export default ListCertidoesService;
