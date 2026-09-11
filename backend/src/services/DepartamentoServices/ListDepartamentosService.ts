import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import Departamento from "../../models/Departamento";
import DepartamentoUsuario from "../../models/DepartamentoUsuario";
import User from "../../models/User";

interface Request {
  companyId: number;
  searchParam?: string;
}

interface Response {
  departamentos: Array<{
    id: number;
    nome: string;
    usuarios: Array<{
      id: number;
      name: string;
      email: string;
      isCoordenador: boolean;
    }>;
    totalUsuarios: number;
  }>;
  count: number;
}

const ListDepartamentosService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<Response> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition.nome = {
      [Op.iLike]: `%${searchParam}%`,
    };
  }

  const departamentos = await Departamento.findAll({
    where: whereCondition,
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
    order: [["nome", "ASC"]],
  });

  const result = departamentos.map((dept) => ({
    id: dept.id,
    nome: dept.nome,
    usuarios: dept.departamentoUsuarios
      .filter((du) => du.user)
      .map((du) => ({
        id: du.user.id,
        name: du.user.name,
        email: du.user.email,
        isCoordenador: du.isCoordenador,
      })),
    totalUsuarios: dept.departamentoUsuarios.filter((du) => du.user).length,
  }));

  return {
    departamentos: result,
    count: result.length,
  };
};

export default ListDepartamentosService;
