import AnotacaoEmpresa from "../../models/AnotacaoEmpresa";
import User from "../../models/User";

interface Request {
  clienteId: number;
  companyId: number;
}

interface Response {
  anotacoes: AnotacaoEmpresa[];
}

const ListAnotacoesEmpresaService = async ({
  clienteId,
  companyId,
}: Request): Promise<Response> => {
  const anotacoes = await AnotacaoEmpresa.findAll({
    where: {
      clienteId,
      companyId,
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return { anotacoes };
};

export default ListAnotacoesEmpresaService;
