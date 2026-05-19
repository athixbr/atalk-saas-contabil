import ControleConfig from "../../models/ControleConfig";
import Departamento from "../../models/Departamento";
import GrupoServico from "../../models/GrupoServico";
import TipoServico from "../../models/TipoServico";
import Prioridade from "../../models/Prioridade";
import Prazo from "../../models/Prazo";
import ControleCliente from "../../models/ControleCliente";
import Cliente from "../../models/Cliente";

interface Request {
  companyId: number;
}

interface Response {
  controles: ControleConfig[];
  count: number;
}

const ListControleConfigService = async ({
  companyId,
}: Request): Promise<Response> => {
  const { rows: controles, count } = await ControleConfig.findAndCountAll({
    where: { companyId },
    include: [
      {
        model: Departamento,
        as: "departamento",
        attributes: ["id", "nome"],
      },
      {
        model: GrupoServico,
        as: "grupoServico",
        attributes: ["id", "nome", "codigo"],
      },
      {
        model: TipoServico,
        as: "tipoServico",
        attributes: ["id", "nome", "codigo"],
      },
      {
        model: Prioridade,
        as: "prioridade",
        attributes: ["id", "nome", "cor"],
      },
      {
        model: Prazo,
        as: "prazo",
        attributes: ["id", "nome", "cor"],
      },
      {
        model: ControleCliente,
        as: "controleClientes",
        include: [
          {
            model: Cliente,
            as: "cliente",
            attributes: ["id", "nome", "cnpj", "cpf"],
          },
        ],
      },
    ],
    order: [["nome", "ASC"]],
  });

  return { controles, count };
};

export default ListControleConfigService;
