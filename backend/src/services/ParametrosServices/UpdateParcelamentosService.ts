import Parcelamentos from "../../models/Parcelamentos";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  nome?: string;
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

const UpdateParcelamentosService = async ({
  id,
  nome,
  descricao,
  clienteId,
  valorTotal,
  numeroParcelas,
  dataInicio,
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
}: Request): Promise<Parcelamentos> => {
  const parcelamentos = await Parcelamentos.findOne({
    where: { id, companyId },
  });

  if (!parcelamentos) {
    throw new AppError("Parcelamento não encontrado", 404);
  }

  if (nome !== undefined && (!nome || !nome.trim())) {
    throw new AppError("O nome do parcelamento é obrigatório", 400);
  }

  const updateData: any = {};
  if (nome !== undefined) updateData.nome = nome.trim();
  if (descricao !== undefined) updateData.descricao = descricao;
  if (clienteId !== undefined) updateData.clienteId = clienteId;
  if (valorTotal !== undefined) updateData.valorTotal = valorTotal;
  if (numeroParcelas !== undefined) updateData.numeroParcelas = numeroParcelas;
  if (dataInicio !== undefined) updateData.dataInicio = dataInicio;
  if (periodicidade !== undefined) updateData.periodicidade = periodicidade;
  if (diaVencimento !== undefined) updateData.diaVencimento = diaVencimento;
  if (gerarTarefas !== undefined) updateData.gerarTarefas = gerarTarefas;
  if (tarefaConfigId !== undefined) updateData.tarefaConfigId = tarefaConfigId;
  if (departamentoId !== undefined) updateData.departamentoId = departamentoId;
  if (responsavelId !== undefined) updateData.responsavelId = responsavelId;
  if (status !== undefined) updateData.status = status;
  if (observacoes !== undefined) updateData.observacoes = observacoes;
  if (ativo !== undefined) updateData.ativo = ativo;

  await parcelamentos.update(updateData);

  return parcelamentos;
};

export default UpdateParcelamentosService;
