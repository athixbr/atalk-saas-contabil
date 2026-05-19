import ClienteCertidao from "../../models/ClienteCertidao";
import AppError from "../../errors/AppError";

interface Request {
  nome: string;
  tipoCliente: "fisica" | "juridica";
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
  companyId: number;
}

const CreateClienteCertidaoService = async (data: Request): Promise<ClienteCertidao> => {
  const { companyId, tipoCliente, cpf, cnpj } = data;

  // Validar se CPF ou CNPJ já existe
  if (tipoCliente === "fisica" && cpf) {
    const clienteExists = await ClienteCertidao.findOne({
      where: { companyId, cpf }
    });

    if (clienteExists) {
      throw new AppError("Já existe um cliente com este CPF");
    }
  }

  if (tipoCliente === "juridica" && cnpj) {
    const clienteExists = await ClienteCertidao.findOne({
      where: { companyId, cnpj }
    });

    if (clienteExists) {
      throw new AppError("Já existe um cliente com este CNPJ");
    }
  }

  const cliente = await ClienteCertidao.create(data);

  return cliente;
};

export default CreateClienteCertidaoService;
