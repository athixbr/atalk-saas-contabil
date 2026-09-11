import Socio from "../../models/Socio";
import Cliente from "../../models/Cliente";
import ClienteSocio from "../../models/ClienteSocio";
import __cjs_sequelize from "sequelize";
const { Op, fn, col, where } = __cjs_sequelize;
interface Request {
  searchParam?: string;
  pageNumber?: string | number;
  limit?: string | number;
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
  limit: requestLimit = 100,
  companyId,
  ativo,
}: Request): Promise<Response> => {
  const searchDigits = searchParam ? searchParam.replace(/\D/g, "") : "";
  const whereCondition: any = {
    companyId,
  };

  if (ativo !== undefined) {
    whereCondition.ativo = ativo;
  }

  if (searchParam) {
    const searchOr: any[] = [
      { nome: { [Op.iLike]: `%${searchParam}%` } },
      { codigoErp: { [Op.iLike]: `%${searchParam}%` } },
      { codigoSistema: { [Op.iLike]: `%${searchParam}%` } },
      { cpf: { [Op.like]: `%${searchDigits || searchParam}%` } },
      { email: { [Op.iLike]: `%${searchParam}%` } },
      { telefone: { [Op.like]: `%${searchParam}%` } },
      { celular: { [Op.like]: `%${searchParam}%` } },
    ];

    if (searchDigits) {
      searchOr.push(
        where(fn("regexp_replace", col("Socio.cpf"), "\\D", "", "g"), {
          [Op.iLike]: `%${searchDigits}%`,
        })
      );
    }

    const clientesOrigemEncontrados = await Cliente.findAll({
      attributes: ["id"],
      where: {
        companyId,
        [Op.or]: [
          { nome: { [Op.iLike]: `%${searchParam}%` } },
          { nomeFantasia: { [Op.iLike]: `%${searchParam}%` } },
          { apelido: { [Op.iLike]: `%${searchParam}%` } },
          { razaoSocial: { [Op.iLike]: `%${searchParam}%` } },
          { codigoErp: { [Op.iLike]: `%${searchParam}%` } },
          { codigoSistema: { [Op.iLike]: `%${searchParam}%` } },
          { cpf: { [Op.iLike]: `%${searchParam}%` } },
          { cnpj: { [Op.iLike]: `%${searchParam}%` } },
          ...(searchDigits
            ? [
                where(fn("regexp_replace", col("cpf"), "\\D", "", "g"), {
                  [Op.iLike]: `%${searchDigits}%`,
                }),
                where(fn("regexp_replace", col("cnpj"), "\\D", "", "g"), {
                  [Op.iLike]: `%${searchDigits}%`,
                }),
              ]
            : []),
        ],
      },
    });

    const clienteOrigemIds = clientesOrigemEncontrados.map((cliente: any) => cliente.id);
    if (clienteOrigemIds.length) {
      searchOr.push({ clienteOrigemId: { [Op.in]: clienteOrigemIds } });
    }

    whereCondition[Op.or] = searchOr;
  }

  const limit = Number(requestLimit) > 0 ? Number(requestLimit) : 100;
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
      {
        model: Cliente,
        as: "clienteOrigem",
        attributes: [
          "id",
          "codigoSistema",
          "codigoErp",
          "nome",
          "nomeFantasia",
          "razaoSocial",
          "apelido",
          "tipoCliente",
          "cnpj",
          "cpf"
        ],
        required: false,
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
