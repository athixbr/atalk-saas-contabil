import ResponsavelDepartamento from "../../models/ResponsavelDepartamento";
import Departamento from "../../models/Departamento";
import User from "../../models/User";

interface Request {
  clienteId: number;
  companyId: number;
}

interface Response {
  responsaveis: ResponsavelDepartamento[];
}

const ListResponsaveisDepartamentoService = async ({
  clienteId,
  companyId,
}: Request): Promise<Response> => {
  const responsaveis = await ResponsavelDepartamento.findAll({
    where: {
      clienteId,
      companyId,
    },
    include: [
      {
        model: Departamento,
        as: "departamento",
        attributes: ["id", "nome"],
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"],
      },
    ],
    order: [["departamentoId", "ASC"]],
  });

  return { responsaveis };
};

export default ListResponsaveisDepartamentoService;
