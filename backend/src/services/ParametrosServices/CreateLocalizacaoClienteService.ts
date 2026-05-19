import LocalizacaoCliente from "../../models/LocalizacaoCliente";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  companyId: number;
}

const CreateLocalizacaoClienteService = async ({
  nome,
  companyId,
}: Request): Promise<LocalizacaoCliente> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do localização do cliente é obrigatório", 400);
  }

  const localizacaoCliente = await LocalizacaoCliente.create({
    nome: nome.trim(),
    companyId,
  });

  return localizacaoCliente;
};

export default CreateLocalizacaoClienteService;
