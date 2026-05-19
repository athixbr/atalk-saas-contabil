import LocalizacaoCliente from "../../models/LocalizacaoCliente";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteLocalizacaoClienteService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const localizacaoCliente = await LocalizacaoCliente.findOne({
    where: { id, companyId },
  });

  if (!localizacaoCliente) {
    throw new AppError("Localização do cliente não encontrado", 404);
  }

  await localizacaoCliente.destroy();
};

export default DeleteLocalizacaoClienteService;
