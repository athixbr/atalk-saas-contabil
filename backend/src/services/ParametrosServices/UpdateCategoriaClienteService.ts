import CategoriaCliente from "../../models/CategoriaCliente";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateCategoriaClienteService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<CategoriaCliente> => {
  const categoriaCliente = await CategoriaCliente.findOne({
    where: { id, companyId },
  });

  if (!categoriaCliente) {
    throw new AppError("Categoria de cliente não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do categoria de cliente é obrigatório", 400);
  }

  await categoriaCliente.update({
    nome: nome.trim(),
  });

  return categoriaCliente;
};

export default UpdateCategoriaClienteService;
