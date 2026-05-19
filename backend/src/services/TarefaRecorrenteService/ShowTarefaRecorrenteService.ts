import TarefaRecorrente from "../../models/TarefaRecorrente";
import Cliente from "../../models/Cliente";
import Socio from "../../models/Socio";
import Departamento from "../../models/Departamento";
import User from "../../models/User";
import AppError from "../../errors/AppError";

interface Request {
  id: string | number;
  companyId: number;
}

const ShowTarefaRecorrenteService = async ({
  id,
  companyId
}: Request): Promise<TarefaRecorrente> => {
  const tarefaRecorrente = await TarefaRecorrente.findOne({
    where: { id, companyId },
    include: [
      {
        model: Departamento,
        as: "departamento",
        attributes: ["id", "nome"]
      },
      {
        model: User,
        as: "usuarioResponsavel",
        attributes: ["id", "name", "email"]
      },
      {
        model: Cliente,
        as: "clientes",
        attributes: ["id", "nome", "cpf", "cnpj", "email", "codigoErp"],
        through: { attributes: [] }
      },
      {
        model: Socio,
        as: "socios",
        attributes: ["id", "nome", "cpf", "email"],
        through: { attributes: [] }
      },
      {
        model: User,
        as: "usuarios",
        attributes: ["id", "name", "email", "profile"],
        through: { attributes: [] }
      }
    ]
  });

  if (!tarefaRecorrente) {
    throw new AppError("ERR_TAREFA_RECORRENTE_NOT_FOUND", 404);
  }

  return tarefaRecorrente;
};

export default ShowTarefaRecorrenteService;
