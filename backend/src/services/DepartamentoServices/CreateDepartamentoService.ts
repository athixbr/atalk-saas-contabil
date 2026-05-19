import Departamento from "../../models/Departamento";
import DepartamentoUsuario from "../../models/DepartamentoUsuario";
import AppError from "../../errors/AppError";

interface UsuarioDepartamento {
  userId: number;
  isCoordenador: boolean;
}

interface Request {
  nome: string;
  usuarios: UsuarioDepartamento[];
  companyId: number;
}

interface Response {
  id: number;
  nome: string;
  companyId: number;
}

const CreateDepartamentoService = async ({
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

  // Verificar se já existe um departamento com o mesmo nome na empresa
  const existingDepartamento = await Departamento.findOne({
    where: { nome, companyId },
  });

  if (existingDepartamento) {
    throw new AppError("Já existe um departamento com este nome", 400);
  }

  // Criar o departamento
  const departamento = await Departamento.create({
    nome,
    companyId,
  });

  // Associar usuários ao departamento
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

export default CreateDepartamentoService;
