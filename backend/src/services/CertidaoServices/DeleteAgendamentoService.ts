import AgendamentoCertidao from "../../models/AgendamentoCertidao";
import AppError from "../../errors/AppError";

const DeleteAgendamentoService = async (id: string, companyId: number): Promise<void> => {
  const agendamento = await AgendamentoCertidao.findOne({
    where: { id, companyId }
  });

  if (!agendamento) {
    throw new AppError("Agendamento não encontrado", 404);
  }

  await agendamento.destroy();
};

export default DeleteAgendamentoService;
