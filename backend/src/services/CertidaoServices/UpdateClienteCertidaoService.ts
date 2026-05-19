import ClienteCertidao from "../../models/ClienteCertidao";
import AppError from "../../errors/AppError";

interface ClienteData {
  nome?: string;
  tipoCliente?: "fisica" | "juridica";
  cpf?: string;
  cnpj?: string;
  razaoSocial?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  email?: string;
  certidoesSelecionadas?: string[];
  ativo?: boolean;
}

interface Request {
  clienteData: ClienteData;
  clienteId: string;
  companyId: number;
}

const UpdateClienteCertidaoService = async ({
  clienteData,
  clienteId,
  companyId
}: Request): Promise<ClienteCertidao> => {
  const cliente = await ClienteCertidao.findOne({
    where: { id: clienteId, companyId }
  });

  if (!cliente) {
    throw new AppError("Cliente não encontrado", 404);
  }

  await cliente.update(clienteData);

  await cliente.reload();

  return cliente;
};

export default UpdateClienteCertidaoService;
