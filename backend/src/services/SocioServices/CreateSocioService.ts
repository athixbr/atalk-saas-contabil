import Socio from "../../models/Socio";
import AppError from "../../errors/AppError";

interface Dependente {
  nome: string;
  cpf: string;
  parentesco: string;
  dataNascimento: string;
}

interface Request {
  nome: string;
  cpf: string;
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
  companyId: number;
}

const CreateSocioService = async ({
  nome,
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
  companyId,
}: Request): Promise<Socio> => {
  // Validações
  if (!nome || nome.trim() === "") {
    throw new AppError("Nome do sócio é obrigatório", 400);
  }

  if (!cpf || cpf.trim() === "") {
    throw new AppError("CPF é obrigatório", 400);
  }

  // Limpar CPF (remover pontos e traços)
  const cpfLimpo = cpf.replace(/\D/g, "");

  if (cpfLimpo.length !== 11) {
    throw new AppError("CPF inválido", 400);
  }

  // Verificar se CPF já existe na company
  const socioExistente = await Socio.findOne({
    where: { cpf: cpfLimpo, companyId },
  });

  if (socioExistente) {
    throw new AppError("CPF já cadastrado nesta empresa", 400);
  }

  // Criar sócio (validar campos vazios para null)
  const socio = await Socio.create({
    nome,
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
    companyId,
  });

  return socio;
};

export default CreateSocioService;
