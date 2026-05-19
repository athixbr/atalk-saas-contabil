import CategoriaCliente from "../../models/CategoriaCliente";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateCategoriaClienteService = async ({
  nome,
  companyId,
}: Request): Promise<CategoriaCliente> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do categoria de cliente é obrigatório", 400);
  }

  const categoriaCliente = await CategoriaCliente.create({
    nome: nome.trim(),
    companyId,
  });

  return categoriaCliente;
};

export default CreateCategoriaClienteService;
