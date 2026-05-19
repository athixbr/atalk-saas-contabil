import Socio from "../../models/Socio";
import Cliente from "../../models/Cliente";
import ClienteSocio from "../../models/ClienteSocio";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface Request {
  searchParam?: string;
  pageNumber?: string | number;
  companyId: number;
  ativo?: boolean;
}

interface Response {
  socios: Socio[];
  count: number;
  hasMore: boolean;
}

const ListSociosService = async ({
  searchParam = "",
  pageNumber = "1",
  companyId,
  ativo,
}: Request): Promise<Response> => {
  const whereCondition: any = {
    companyId,
  };

  if (ativo !== undefined) {
    whereCondition.ativo = ativo;
  }

  if (searchParam) {
    whereCondition[Op.or] = [
      { nome: { [Op.iLike]: `%${searchParam}%` } },
      { cpf: { [Op.like]: `%${searchParam.replace(/\D/g, "")}%` } },
      { email: { [Op.iLike]: `%${searchParam}%` } },
      { telefone: { [Op.like]: `%${searchParam}%` } },
      { celular: { [Op.like]: `%${searchParam}%` } },
    ];
  }

  const limit = 100;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: socios } = await Socio.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["nome", "ASC"]],
    include: [
      {
        model: Cliente,
        as: "clientes",
        attributes: [
          "id",
          "nome",
          "nomeFantasia",
          "razaoSocial",
          "tipoCliente",
          "cnpj",
          "cpf"
        ],
        through: {
          attributes: [
            "id",
            "percentual",
            "cargo",
            "recebeProlabore",
            "valorProlabore",
            "podeAssinar",
            "isAdministrador",
            "ativo",
          ],
        },
      },
    ],
  });

  const hasMore = count > offset + socios.length;

  return {
    socios,
    count,
    hasMore,
  };
};

export default ListSociosService;
