import ResponsavelDepartamento from "../../models/ResponsavelDepartamento";
import Departamento from "../../models/Departamento";
import User from "../../models/User";
import AppError from "../../errors/AppError";

interface Request {
  clienteId: number;
  departamentoId: number;
  userId: number;
  companyId: number;
}

const CreateResponsavelDepartamentoService = async ({
  clienteId,
  departamentoId,
  userId,
  companyId,
}: Request): Promise<ResponsavelDepartamento> => {
  // Validar se o departamento existe
  const departamento = await Departamento.findOne({
    where: {
      id: departamentoId,
      companyId,
    },
  });

  if (!departamento) {
    throw new AppError("Departamento não encontrado", 404);
  }

  // Validar se o usuário existe
  const user = await User.findOne({
    where: {
      id: userId,
      companyId,
    },
  });

  if (!user) {
    throw new AppError("Usuário não encontrado", 404);
  }

  // Verificar se já existe essa combinação
  const existente = await ResponsavelDepartamento.findOne({
    where: {
      clienteId,
      departamentoId,
      userId,
      companyId,
    },
  });

  if (existente) {
    throw new AppError(
      "Este usuário já é responsável por este departamento neste cliente",
      400
    );
  }

  const responsavel = await ResponsavelDepartamento.create({
    clienteId,
    departamentoId,
    userId,
    companyId,
  });

  // Retornar com os relacionamentos carregados
  const responsavelCompleto = await ResponsavelDepartamento.findByPk(
    responsavel.id,
    {
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
    }
  );

  return responsavelCompleto!;
};

export default CreateResponsavelDepartamentoService;
