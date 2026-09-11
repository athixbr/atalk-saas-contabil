import ClienteVigencia from "../../models/ClienteVigencia";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  clienteId: number;
}

const DeleteClienteVigenciaService = async ({
  id,
  clienteId,
}: Request): Promise<void> => {
  const vigencia = await ClienteVigencia.findOne({
    where: { id, clienteId },
  });

  if (!vigencia) {
    throw new AppError("Vigência não encontrada", 404);
  }

  await vigencia.destroy();
};

export default DeleteClienteVigenciaService;
