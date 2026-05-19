import CategoriaCliente from "../../models/CategoriaCliente";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteCategoriaClienteService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const categoriaCliente = await CategoriaCliente.findOne({
    where: { id, companyId },
  });

  if (!categoriaCliente) {
    throw new AppError("Categoria de cliente não encontrado", 404);
  }

  await categoriaCliente.destroy();
};

export default DeleteCategoriaClienteService;
