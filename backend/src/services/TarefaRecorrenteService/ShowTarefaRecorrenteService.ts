import TarefaRecorrente from "../../models/TarefaRecorrente";
import Cliente from "../../models/Cliente";
import Socio from "../../models/Socio";
import Departamento from "../../models/Departamento";
import User from "../../models/User";
import EmailTemplate from "../../models/EmailTemplate";
import WhatsappTemplate from "../../models/WhatsappTemplate";
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
    attributes: {
      exclude: ["diasConclusao"]
    },
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
        through: { attributes: ["vencimento", "controleComDataId"] }
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
      },
      {
        model: EmailTemplate,
        as: "emailTemplate",
        attributes: ["id", "title", "subject"]
      },
      {
        model: WhatsappTemplate,
        as: "whatsappTemplate",
        attributes: ["id", "title"]
      }
    ]
  });

  if (!tarefaRecorrente) {
    throw new AppError("ERR_TAREFA_RECORRENTE_NOT_FOUND", 404);
  }
  tarefaRecorrente.setDataValue("codigo", String(tarefaRecorrente.id));

  return tarefaRecorrente;
};

export default ShowTarefaRecorrenteService;
