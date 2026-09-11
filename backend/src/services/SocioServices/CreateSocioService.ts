import Socio from "../../models/Socio";
import Cliente from "../../models/Cliente";
import AppError from "../../errors/AppError";
import GetNextCodigoSistemaService from "../ClienteServices/GetNextCodigoSistemaService";

interface Dependente {
  nome: string;
  cpf: string;
  parentesco: string;
  dataNascimento: string;
}

interface Request {
  nome: string;
  codigoErp?: string;
  codigoSistema?: string;
  cpf?: string;
  rg?: string;
  dataNascimento?: Date;
  nacionalidade?: string;
  naturalidade?: string;
  estadoCivil?: "solteiro" | "casado" | "divorciado" | "viuvo" | "uniao_estavel";
  profissao?: string;
  telefone?: string;
  celular?: string;
  email?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  dependentes?: Dependente[];
  banco?: string;
  agencia?: string;
  conta?: string;
  tipoConta?: "corrente" | "poupanca";
  chavePix?: string;
  observacoes?: string;
  ativo?: boolean;
  clienteOrigemId?: number | string;
  companyId: number;
}

const CreateSocioService = async ({
  nome,
  codigoErp,
  codigoSistema,
  cpf,
  rg,
  dataNascimento,
  nacionalidade,
  naturalidade,
  estadoCivil,
  profissao,
  telefone,
  celular,
  email,
  cep,
  logradouro,
  numero,
  complemento,
  bairro,
  cidade,
  estado,
  dependentes = [],
  banco,
  agencia,
  conta,
  tipoConta,
  chavePix,
  observacoes,
  ativo = true,
  clienteOrigemId,
  companyId,
}: Request): Promise<Socio> => {
  // Validações
  if (!nome || nome.trim() === "") {
    throw new AppError("Nome do sócio é obrigatório", 400);
  }

  let codigoErpSanitizado = codigoErp?.trim() || null;
  if (codigoErpSanitizado && !/^\d{7}$/.test(codigoErpSanitizado)) {
    throw new AppError("Código ERP deve conter exatamente 7 dígitos", 400);
  }

  let codigoSistemaSanitizado = codigoSistema?.trim() || null;

  if (clienteOrigemId) {
    const clienteOrigem = await Cliente.findOne({
      where: { id: clienteOrigemId, companyId },
      attributes: ["id", "codigoErp", "codigoSistema"],
    });

    if (!clienteOrigem) {
      throw new AppError("Cliente de origem não encontrado", 404);
    }

    codigoErpSanitizado = clienteOrigem.codigoErp?.trim() || null;
    codigoSistemaSanitizado = clienteOrigem.codigoSistema?.trim() || String(clienteOrigem.id);
  }

  // CPF/CNPJ é opcional; quando informado, deve ser válido e único na company
  let cpfLimpo: string | null = null;
  if (cpf && cpf.trim() !== "") {
    cpfLimpo = cpf.replace(/\D/g, "");

    if (![11, 14].includes(cpfLimpo.length)) {
      throw new AppError("CPF/CNPJ inválido", 400);
    }

    const socioExistente = await Socio.findOne({
      where: { cpf: cpfLimpo, companyId },
    });

    if (socioExistente) {
      throw new AppError("CPF/CNPJ já cadastrado nesta empresa", 400);
    }
  }

  // Criar sócio (validar campos vazios para null)
  const socio = await Socio.create({
    nome,
    codigoErp: codigoErpSanitizado,
    codigoSistema: codigoSistemaSanitizado || await GetNextCodigoSistemaService(companyId),
    cpf: cpfLimpo,
    rg: rg && rg.trim() !== "" ? rg : null,
    dataNascimento: dataNascimento && !isNaN(new Date(dataNascimento).getTime()) ? dataNascimento : null,
    nacionalidade: nacionalidade && nacionalidade.trim() !== "" ? nacionalidade : "Brasileira",
    naturalidade: naturalidade && naturalidade.trim() !== "" ? naturalidade : null,
    estadoCivil: estadoCivil && estadoCivil.trim() !== "" ? estadoCivil : null,
    profissao: profissao && profissao.trim() !== "" ? profissao : null,
    telefone: telefone && telefone.trim() !== "" ? telefone : null,
    celular: celular && celular.trim() !== "" ? celular : null,
    email: email && email.trim() !== "" ? email : null,
    cep: cep && cep.trim() !== "" ? cep : null,
    logradouro: logradouro && logradouro.trim() !== "" ? logradouro : null,
    numero: numero && numero.trim() !== "" ? numero : null,
    complemento: complemento && complemento.trim() !== "" ? complemento : null,
    bairro: bairro && bairro.trim() !== "" ? bairro : null,
    cidade: cidade && cidade.trim() !== "" ? cidade : null,
    estado: estado && estado.trim() !== "" ? estado : null,
    dependentes,
    banco: banco && banco.trim() !== "" ? banco : null,
    agencia: agencia && agencia.trim() !== "" ? agencia : null,
    conta: conta && conta.trim() !== "" ? conta : null,
    tipoConta: tipoConta && tipoConta.trim() !== "" ? tipoConta : null,
    chavePix: chavePix && chavePix.trim() !== "" ? chavePix : null,
    observacoes: observacoes && observacoes.trim() !== "" ? observacoes : null,
    ativo,
    clienteOrigemId: clienteOrigemId ? Number(clienteOrigemId) : null,
    companyId,
  });

  return socio;
};

export default CreateSocioService;
