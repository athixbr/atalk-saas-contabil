import ClienteContato from "../../models/ClienteContato";
import ContatoDepartamento from "../../models/ContatoDepartamento";
import Departamento from "../../models/Departamento";
import AppError from "../../errors/AppError";

interface Request {
  clienteId: number;
  clienteContatoId: number;
  companyId: number;
}

interface Response {
  departamentos: Departamento[];
}

const ListContatoDepartamentosService = async ({
  clienteId,
  clienteContatoId,
  companyId,
}: Request): Promise<Response> => {
  const contato = await ClienteContato.findOne({
    where: { id: clienteContatoId, clienteId },
  });

  if (!contato) {
    throw new AppError("Contato não encontrado", 404);
  }

  const vinculos = await ContatoDepartamento.findAll({
    where: { clienteContatoId, companyId },
    include: [
      {
        model: Departamento,
        as: "departamento",
        attributes: ["id", "nome"],
      },
    ],
    order: [[{ model: Departamento, as: "departamento" }, "nome", "ASC"]],
  });

  const departamentos = vinculos
    .map((vinculo) => vinculo.departamento)
    .filter(Boolean);

  return { departamentos };
};

export default ListContatoDepartamentosService;
