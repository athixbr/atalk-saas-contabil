import Socio from "../../models/Socio";
import Cliente from "../../models/Cliente";
import AppError from "../../errors/AppError";

interface Dependente {
  nome: string;
  cpf: string;
  parentesco: string;
  dataNascimento: string;
}

interface Request {
  socioData: {
    nome?: string;
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
    clienteOrigemId?: number | string | null;
  };
  socioId: string | number;
  companyId: number;
}

const UpdateSocioService = async ({
  socioData,
  socioId,
  companyId,
}: Request): Promise<Socio> => {
  const socio = await Socio.findOne({
    where: { id: socioId, companyId },
  });

  if (!socio) {
    throw new AppError("Sócio não encontrado", 404);
  }

  const codigoErpSanitizado = socioData.codigoErp?.trim() || null;
  if (socioData.codigoErp !== undefined && codigoErpSanitizado && !/^\d{7}$/.test(codigoErpSanitizado)) {
    throw new AppError("Código ERP deve conter exatamente 7 dígitos", 400);
  }

  // Se CPF/CNPJ for alterado, validar
  if (socioData.cpf && socioData.cpf !== socio.cpf) {
    const cpfLimpo = socioData.cpf.replace(/\D/g, "");

    if (![11, 14].includes(cpfLimpo.length)) {
      throw new AppError("CPF/CNPJ inválido", 400);
    }

    const socioExistente = await Socio.findOne({
      where: { cpf: cpfLimpo, companyId },
    });

    if (socioExistente && socioExistente.id !== socio.id) {
      throw new AppError("CPF/CNPJ já cadastrado para outro sócio", 400);
    }

    socioData.cpf = cpfLimpo;
  }

  // Validar campos vazios e converter para null
  const cleanedData: any = {};
  
  for (const [key, value] of Object.entries(socioData)) {
    if (value === "" || value === undefined) {
      // Campos vazios viram null, exceto arrays
      cleanedData[key] = Array.isArray(value) ? [] : null;
    } else if (typeof value === "string" && value.trim() === "") {
      cleanedData[key] = null;
    } else {
      cleanedData[key] = value;
    }
  }

  if (socioData.codigoErp !== undefined) {
    cleanedData.codigoErp = codigoErpSanitizado;
  }

  if (socioData.clienteOrigemId !== undefined && socioData.clienteOrigemId !== null) {
    const clienteOrigem = await Cliente.findOne({
      where: { id: socioData.clienteOrigemId, companyId },
    });

    if (!clienteOrigem) {
      throw new AppError("Cliente de origem não encontrado", 404);
    }

    cleanedData.clienteOrigemId = Number(socioData.clienteOrigemId);
  }

  // Validar data de nascimento
  if (cleanedData.dataNascimento && isNaN(new Date(cleanedData.dataNascimento).getTime())) {
    cleanedData.dataNascimento = null;
  }

  await socio.update(cleanedData);

  await socio.reload();

  return socio;
};

export default UpdateSocioService;
