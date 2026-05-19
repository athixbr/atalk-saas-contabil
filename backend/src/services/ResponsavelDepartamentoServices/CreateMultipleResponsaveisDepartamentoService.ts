import ResponsavelDepartamento from "../../models/ResponsavelDepartamento";
import Departamento from "../../models/Departamento";
import User from "../../models/User";
import AppError from "../../errors/AppError";

interface Request {
  clienteId: number;
  departamentoId: number;
  userIds: number[];
  companyId: number;
}

interface Response {
  created: ResponsavelDepartamento[];
  skipped: Array<{ userId: number; reason: string }>;
}

const CreateMultipleResponsaveisDepartamentoService = async ({
  clienteId,
  departamentoId,
  userIds,
  companyId,
}: Request): Promise<Response> => {
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

  if (!userIds || userIds.length === 0) {
    throw new AppError("Nenhum usuário selecionado", 400);
  }

  const created: ResponsavelDepartamento[] = [];
  const skipped: Array<{ userId: number; reason: string }> = [];

  for (const userId of userIds) {
    // Validar se o usuário existe
    const user = await User.findOne({
      where: {
        id: userId,
        companyId,
      },
    });

    if (!user) {
      skipped.push({ userId, reason: "Usuário não encontrado" });
      continue;
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
      skipped.push({ userId, reason: "Já cadastrado" });
      continue;
    }

    const responsavel = await ResponsavelDepartamento.create({
      clienteId,
      departamentoId,
      userId,
      companyId,
    });

    // Carregar com os relacionamentos
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

    if (responsavelCompleto) {
      created.push(responsavelCompleto);
    }
  }

  return { created, skipped };
};

export default CreateMultipleResponsaveisDepartamentoService;
