import Socio from "../../models/Socio";
import Cliente from "../../models/Cliente";
import ClienteSocio from "../../models/ClienteSocio";
import AppError from "../../errors/AppError";

interface Request {
  id: string | number;
  companyId: number;
}

const ShowSocioService = async ({ id, companyId }: Request): Promise<Socio> => {
  const socio = await Socio.findOne({
    where: { id, companyId },
    include: [
      {
        model: Cliente,
        as: "clientes",
        attributes: [
          "id",
          "nome",
          "tipoCliente",
          "cnpj",
          "cpf",
          "razaoSocial",
          "nomeFantasia",
        ],
        through: {
          attributes: [
            "id",
            "percentual",
            "cargo",
            "valorQuota",
            "quantidadeQuotas",
            "dataEntrada",
            "dataSaida",
            "podeAssinar",
            "poderIsolado",
            "isAdministrador",
            "recebeProlabore",
            "valorProlabore",
            "observacoes",
            "ativo",
          ],
        },
      },
    ],
  });

  if (!socio) {
    throw new AppError("Sócio não encontrado", 404);
  }

  return socio;
};

export default ShowSocioService;
