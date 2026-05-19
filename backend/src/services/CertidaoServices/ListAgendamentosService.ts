import AgendamentoCertidao from "../../models/AgendamentoCertidao";

const ListAgendamentosService = async (companyId: number): Promise<AgendamentoCertidao[]> => {
  const agendamentos = await AgendamentoCertidao.findAll({
    where: { companyId },
    order: [["data", "DESC"], ["hora", "DESC"]]
  });

  return agendamentos;
};

export default ListAgendamentosService;
