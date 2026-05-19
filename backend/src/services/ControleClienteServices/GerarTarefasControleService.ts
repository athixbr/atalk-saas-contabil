import { addDays, addMonths, parseISO } from "date-fns";
import ControleCliente from "../../models/ControleCliente";
import ControleConfig from "../../models/ControleConfig";
import TarefaGerada from "../../models/TarefaGerada";
import AppError from "../../errors/AppError";

interface GerarTarefasData {
  controleClienteId: number;
  companyId: number;
  forcarRegeneracao?: boolean;
}

interface ResultadoGeracao {
  tarefasGeradas: number;
  tarefas: TarefaGerada[];
}

const GerarTarefasControleService = async ({
  controleClienteId,
  companyId,
  forcarRegeneracao = false,
}: GerarTarefasData): Promise<ResultadoGeracao> => {
  // Buscar vínculo
  const vinculo = await ControleCliente.findOne({
    where: { id: controleClienteId },
    include: [
      {
        model: ControleConfig,
        as: "controleConfig",
        where: { companyId },
        include: [
          { association: "prazo" },
          { association: "prioridade" }
        ]
      },
      { association: "cliente" },
    ],
  });

  if (!vinculo) {
    throw new AppError("Vínculo não encontrado", 404);
  }

  const controleConfig = vinculo.controleConfig;

  if (!controleConfig) {
    throw new AppError("Configuração do controle não encontrada", 404);
  }

  // Excluir tarefas antigas se forçar regeneração
  if (forcarRegeneracao) {
    await TarefaGerada.destroy({
      where: {
        controleClienteId: controleClienteId,
        companyId,
      },
    });
  } else {
    // Verificar se já existem tarefas geradas para este vínculo específico
    const tarefasExistentes = await TarefaGerada.count({
      where: {
        controleClienteId: controleClienteId,
        companyId,
      },
    });

    if (tarefasExistentes > 0) {
      console.log(`Vínculo ${controleClienteId} já possui ${tarefasExistentes} tarefa(s) gerada(s)`);
      return {
        tarefasGeradas: 0,
        tarefas: [],
      };
    }
  }

  const tarefasCriadas: TarefaGerada[] = [];
  const dataInicio = vinculo.dataInicio ? parseISO(vinculo.dataInicio.toString()) : new Date();
  const dataFim = vinculo.dataFim ? parseISO(vinculo.dataFim.toString()) : null;

  // Calcular data de entrega baseada no prazo (usar prazo padrão de 7 dias)
  const diasPrazo = 7; // TODO: Criar campo numérico em Prazo ou ControleConfig
  const dataEntrega = addDays(dataInicio, diasPrazo);

  // Logs para debug
  console.log(`Gerando tarefa para controle ${controleConfig.nome} (${controleConfig.codigo})`);
  console.log(`Departamento: ${vinculo.departamentoId}, Usuário: ${vinculo.usuarioId}`);

  // Criar tarefa inicial (sempre cria, independente de ser recorrente ou não)
  const tarefa = await TarefaGerada.create({
    tarefaInfoId: null, // Não temos tarefaInfoId neste contexto
    clienteId: vinculo.clienteId,
    controleClienteId: controleClienteId, // ID do vínculo controle-cliente
    dataInicio: dataInicio,
    dataEntrega: dataEntrega,
    status: "pendente",
    titulo: controleConfig.nome,
    descricao: `Tarefa gerada automaticamente do controle: ${controleConfig.nome}`,
    departamentoId: vinculo.departamentoId,
    userId: vinculo.usuarioId,
    companyId,
    checklistCompleto: null,
    observacoes: `Controle: ${controleConfig.codigo} - ${controleConfig.nome}`,
  });

  tarefasCriadas.push(tarefa);

  // Se for recorrente e tiver data fim, gerar mais tarefas
  if (controleConfig.recorrente && dataFim) {
    let dataAtual = addMonths(dataInicio, 1); // Por padrão mensal
    let contador = 1;
    const limite = 365; // Limitar a 365 tarefas

    while (contador < limite && dataAtual <= dataFim) {
      const dataEntregaRecorrente = addDays(dataAtual, diasPrazo);

      const tarefaRecorrente = await TarefaGerada.create({
        tarefaInfoId: null,
        clienteId: vinculo.clienteId,
        controleClienteId: controleClienteId, // ID do vínculo controle-cliente
        dataInicio: dataAtual,
        dataEntrega: dataEntregaRecorrente,
        status: "pendente",
        titulo: controleConfig.nome,
        descricao: `Tarefa gerada automaticamente do controle: ${controleConfig.nome}`,
        departamentoId: vinculo.departamentoId,
        userId: vinculo.usuarioId,
        companyId,
        checklistCompleto: null,
        observacoes: `Controle recorrente: ${controleConfig.codigo} - ${controleConfig.nome}`,
      });

      tarefasCriadas.push(tarefaRecorrente);
      dataAtual = addMonths(dataAtual, 1);
      contador++;
    }
  }

  console.log(`Geradas ${tarefasCriadas.length} tarefas para o vínculo ${controleClienteId}`);

  return {
    tarefasGeradas: tarefasCriadas.length,
    tarefas: tarefasCriadas,
  };
};

export default GerarTarefasControleService;
