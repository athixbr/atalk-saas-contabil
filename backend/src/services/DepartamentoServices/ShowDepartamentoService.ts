import Departamento from "../../models/Departamento";
import DepartamentoUsuario from "../../models/DepartamentoUsuario";
import User from "../../models/User";
import AppError from "../../errors/AppError";

interface Request {
  id: string | number;
  companyId: number;
}

interface Response {
  id: number;
  nome: string;
  usuarios: Array<{
    id: number;
    name: string;
    email: string;
    isCoordenador: boolean;
  }>;
}

const ShowDepartamentoService = async ({
  id,
  companyId,
}: Request): Promise<Response> => {
  const departamento = await Departamento.findOne({
    where: { id, companyId },
    include: [
      {
        model: DepartamentoUsuario,
        as: "departamentoUsuarios",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email"],
          },
        ],
      },
    ],
  });

  if (!departamento) {
    throw new AppError("Departamento não encontrado", 404);
  }

  return {
    id: departamento.id,
    nome: departamento.nome,
    usuarios: departamento.departamentoUsuarios.map((du) => ({
      id: du.user.id,
      name: du.user.name,
      email: du.user.email,
      isCoordenador: du.isCoordenador,
    })),
  };
};

export default ShowDepartamentoService;
