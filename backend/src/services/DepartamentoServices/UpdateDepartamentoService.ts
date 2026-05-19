import Departamento from "../../models/Departamento";
import DepartamentoUsuario from "../../models/DepartamentoUsuario";
import AppError from "../../errors/AppError";

interface UsuarioDepartamento {
  userId: number;
  isCoordenador: boolean;
}

interface Request {
  id: string | number;
  nome: string;
  usuarios: UsuarioDepartamento[];
  companyId: number;
}

interface Response {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateDepartamentoService = async ({
  id,
  nome,
  usuarios,
  companyId,
}: Request): Promise<Response> => {
  if (!nome || nome.trim() === "") {
    throw new AppError("Nome do departamento é obrigatório", 400);
  }

  if (!usuarios || usuarios.length === 0) {
    throw new AppError("Selecione pelo menos um usuário para o departamento", 400);
  }

  const departamento = await Departamento.findOne({
    where: { id, companyId },
  });

  if (!departamento) {
    throw new AppError("Departamento não encontrado", 404);
  }

  // Verificar se já existe outro departamento com o mesmo nome
  const existingDepartamento = await Departamento.findOne({
    where: { nome, companyId },
  });

  if (existingDepartamento && existingDepartamento.id !== departamento.id) {
    throw new AppError("Já existe um departamento com este nome", 400);
  }

  // Atualizar o departamento
  await departamento.update({ nome });

  // Remover todas as associações antigas
  await DepartamentoUsuario.destroy({
    where: { departamentoId: departamento.id },
  });

  // Criar novas associações
  const usuariosData = usuarios.map((u) => ({
    departamentoId: departamento.id,
    userId: u.userId,
    isCoordenador: u.isCoordenador || false,
  }));

  await DepartamentoUsuario.bulkCreate(usuariosData);

  return {
    id: departamento.id,
    nome: departamento.nome,
    companyId: departamento.companyId,
  };
};

export default UpdateDepartamentoService;
