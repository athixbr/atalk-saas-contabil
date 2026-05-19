import Parcelamentos from "../../models/Parcelamentos";
import ParcelamentosParcela from "../../models/ParcelamentosParcela";
import AppError from "../../errors/AppError";
import { addMonths, addDays, format } from "date-fns";

interface Request {
  nome: string;
  descricao?: string;
  clienteId?: number;
  valorTotal?: number;
  numeroParcelas?: number;
  dataInicio?: Date | string;
  periodicidade?: "mensal" | "quinzenal" | "semanal";
  diaVencimento?: number;
  gerarTarefas?: boolean;
  tarefaConfigId?: number;
  departamentoId?: number;
  responsavelId?: number;
  status?: string;
  observacoes?: string;
  ativo?: boolean;
  companyId: number;
}

const CreateParcelamentosService = async ({
  nome,
  descricao,
  clienteId,
  valorTotal = 0,
  numeroParcelas = 1,
  dataInicio,
  periodicidade = "mensal",
  diaVencimento,
  gerarTarefas = false,
  tarefaConfigId,
  departamentoId,
  responsavelId,
  status = "ativo",
  observacoes,
  ativo = true,
  companyId,
}: Request): Promise<Parcelamentos> => {
  if (!nome || !nome.trim()) {
    throw new AppError("O nome do parcelamento é obrigatório", 400);
  }

  if (numeroParcelas < 1) {
    throw new AppError("O número de parcelas deve ser maior que zero", 400);
  }

  const parcelamentos = await Parcelamentos.create({
    nome: nome.trim(),
    descricao,
    clienteId,
    valorTotal,
    numeroParcelas,
    dataInicio: dataInicio || new Date(),
    periodicidade,
    diaVencimento,
    gerarTarefas,
    tarefaConfigId,
    departamentoId,
    responsavelId,
    status,
    observacoes,
    ativo,
    companyId,
  });

  // Gerar parcelas automaticamente
  const valorParcela = valorTotal / numeroParcelas;
  const parcelas = [];
  
  let dataAtual = new Date(dataInicio || new Date());
  if (diaVencimento) {
    dataAtual.setDate(diaVencimento);
  }

  for (let i = 1; i <= numeroParcelas; i++) {
    let dataVencimento = dataAtual;

    if (i > 1) {
      switch (periodicidade) {
        case "mensal":
          dataVencimento = addMonths(dataAtual, 1);
          break;
        case "quinzenal":
          dataVencimento = addDays(dataAtual, 15);
          break;
        case "semanal":
          dataVencimento = addDays(dataAtual, 7);
          break;
      }
      dataAtual = dataVencimento;
    }

    parcelas.push({
      parcelamentoId: parcelamentos.id,
      numeroParcela: i,
      valor: valorParcela,
      dataVencimento,
      status: "pendente",
      companyId,
    });
  }

  await ParcelamentosParcela.bulkCreate(parcelas);

  return parcelamentos;
};

export default CreateParcelamentosService;
