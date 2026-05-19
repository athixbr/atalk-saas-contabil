import AgendamentoCertidao from "../../models/AgendamentoCertidao";
import AppError from "../../errors/AppError";

const ShowAgendamentoService = async (id: string, companyId: number): Promise<AgendamentoCertidao> => {
  const agendamento = await AgendamentoCertidao.findOne({
    where: { id, companyId }
  });

  if (!agendamento) {
    throw new AppError("Agendamento não encontrado", 404);
  }

  return agendamento;
};

export default ShowAgendamentoService;
