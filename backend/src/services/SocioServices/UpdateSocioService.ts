import Socio from "../../models/Socio";
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

  // Se CPF for alterado, validar
  if (socioData.cpf && socioData.cpf !== socio.cpf) {
    const cpfLimpo = socioData.cpf.replace(/\D/g, "");

    if (cpfLimpo.length !== 11) {
      throw new AppError("CPF inválido", 400);
    }

    const socioExistente = await Socio.findOne({
      where: { cpf: cpfLimpo, companyId },
    });

    if (socioExistente && socioExistente.id !== socio.id) {
      throw new AppError("CPF já cadastrado para outro sócio", 400);
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

  // Validar data de nascimento
  if (cleanedData.dataNascimento && isNaN(new Date(cleanedData.dataNascimento).getTime())) {
    cleanedData.dataNascimento = null;
  }

  await socio.update(cleanedData);

  await socio.reload();

  return socio;
};

export default UpdateSocioService;
