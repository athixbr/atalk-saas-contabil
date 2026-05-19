import AgendamentoCertidao from "../../models/AgendamentoCertidao";

interface Request {
  data: Date;
  hora: string;
  descricao?: string;
  clienteIds: number[];
  certidoesCategoriasIds?: string[];
  intervaloMinutos?: number;
  companyId: number;
}

const CreateAgendamentoService = async (data: Request): Promise<AgendamentoCertidao> => {
  const agendamento = await AgendamentoCertidao.create(data);

  return agendamento;
};

export default CreateAgendamentoService;
