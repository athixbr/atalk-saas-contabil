import LocalizacaoCliente from "../../models/LocalizacaoCliente";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome: string;
  companyId: number;
}

const UpdateLocalizacaoClienteService = async ({
  id,
  nome,
  companyId,
}: Request): Promise<LocalizacaoCliente> => {
  const localizacaoCliente = await LocalizacaoCliente.findOne({
    where: { id, companyId },
  });

  if (!localizacaoCliente) {
    throw new AppError("Localização do cliente não encontrado", 404);
  }

  if (!nome || !nome.trim()) {
    throw new AppError("O nome do localização do cliente é obrigatório", 400);
  }

  await localizacaoCliente.update({
    nome: nome.trim(),
  });

  return localizacaoCliente;
};

export default UpdateLocalizacaoClienteService;
