import AgendamentoCertidao from "../../models/AgendamentoCertidao";
import AppError from "../../errors/AppError";

interface AgendamentoData {
  data?: Date;
  hora?: string;
  descricao?: string;
  clienteIds?: number[];
  certidoesCategoriasIds?: string[];
  intervaloMinutos?: number;
  status?: "pendente" | "processando" | "concluido" | "erro";
}

interface Request {
  agendamentoData: AgendamentoData;
  agendamentoId: string;
  companyId: number;
}

const UpdateAgendamentoService = async ({
  agendamentoData,
  agendamentoId,
  companyId
}: Request): Promise<AgendamentoCertidao> => {
  const agendamento = await AgendamentoCertidao.findOne({
    where: { id: agendamentoId, companyId }
  });

  if (!agendamento) {
    throw new AppError("Agendamento não encontrado", 404);
  }

  await agendamento.update(agendamentoData);

  await agendamento.reload();

  return agendamento;
};

export default UpdateAgendamentoService;
