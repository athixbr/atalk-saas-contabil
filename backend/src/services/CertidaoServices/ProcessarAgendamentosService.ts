import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import AgendamentoCertidao from "../../models/AgendamentoCertidao";
import Cliente from "../../models/Cliente";
import ConsultarCertidaoService from "./ConsultarCertidaoService";

// Intervalo padrão de 3 minutos entre clientes (pode ser sobrescrito pelo agendamento)
const INTERVALO_PADRAO_MS = 3 * 60 * 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface ProcessarAgendamentosRequest {
  agendamentoId?: number;
  companyId: number;
  forcarExecucao?: boolean;
}

interface ProcessarAgendamentosResponse {
  processados: number;
  sucessos: number;
  erros: number;
  detalhes: Array<{
    agendamentoId: number;
    clienteNome: string;
    certidoesProcessadas: number;
    status: string;
  }>;
}

const ProcessarAgendamentosService = async (
  data: ProcessarAgendamentosRequest
): Promise<ProcessarAgendamentosResponse> => {
  const { agendamentoId, companyId, forcarExecucao = false } = data;

  console.log("[ProcessarAgendamentos] Iniciando processamento...");

  // Buscar agendamentos a processar
  const now = new Date();
  const dataAtual = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const horaAtual = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

  const whereClause: any = {
    companyId,
    status: "pendente"
  };

  // Se informou ID específico, processa só ele (modo manual)
  if (agendamentoId) {
    whereClause.id = agendamentoId;
  } else if (!forcarExecucao) {
    // Modo automático: processa apenas agendamentos com data/hora <= agora
    whereClause[Op.or] = [
      {
        data: {
          [Op.lt]: dataAtual
        }
      },
      {
        data: dataAtual,
        hora: {
          [Op.lte]: horaAtual
        }
      }
    ];
  }

  const agendamentos = await AgendamentoCertidao.findAll({
    where: whereClause,
    order: [["data", "ASC"], ["hora", "ASC"]]
  });

  console.log(`[ProcessarAgendamentos] Encontrados ${agendamentos.length} agendamento(s)`);

  if (agendamentos.length === 0) {
    return {
      processados: 0,
      sucessos: 0,
      erros: 0,
      detalhes: []
    };
  }

  let processados = 0;
  let sucessosTotais = 0;
  let errosTotais = 0;
  const detalhes: any[] = [];

  // Processar cada agendamento
  for (const agendamento of agendamentos) {
    console.log(`[ProcessarAgendamentos] Processando agendamento #${agendamento.id}`);

    // Atualizar status para "processando"
    await agendamento.update({ status: "processando" });

    let sucessosAgendamento = 0;
    let errosAgendamento = 0;
    const clientesProcessados: string[] = [];

    try {
      // Processar cada cliente do agendamento
      for (let clienteIdx = 0; clienteIdx < agendamento.clienteIds.length; clienteIdx++) {
        const clienteId = agendamento.clienteIds[clienteIdx];
        const cliente = await Cliente.findOne({
          where: { id: clienteId, companyId }
        });

        if (!cliente) {
          console.log(`[ProcessarAgendamentos] Cliente #${clienteId} não encontrado`);
          errosAgendamento++;
          continue;
        }

        clientesProcessados.push(cliente.nome);

        // Determinar quais certidões processar:
        // 1. Certidões do agendamento (prioridade), 2. Certidões do cliente, 3. Fallback campo verde
        let categoriasAProcessar: string[] = [];

        if (agendamento.certidoesCategoriasIds && agendamento.certidoesCategoriasIds.length > 0) {
          categoriasAProcessar = agendamento.certidoesCategoriasIds;
        } else if (cliente.certidoesSelecionadas && cliente.certidoesSelecionadas.length > 0) {
          categoriasAProcessar = cliente.certidoesSelecionadas;
        } else {
          // Fallback: prefeitura-campo-verde se cliente não tem certidões selecionadas
          console.log(`[ProcessarAgendamentos] Cliente ${cliente.nome} sem certidões no agendamento nem no cadastro, usando fallback prefeitura-campo-verde`);
          categoriasAProcessar = ["prefeitura-campo-verde"];
        }

        // Verificar se cliente tem certidões para processar
        if (categoriasAProcessar.length === 0) {
          console.log(`[ProcessarAgendamentos] Cliente ${cliente.nome} sem certidões selecionadas`);
          errosAgendamento++;
          continue;
        }

        // Consultar cada certidão do cliente
        for (const categoria of categoriasAProcessar) {
          try {
            console.log(`[ProcessarAgendamentos] Consultando ${categoria} para ${cliente.nome}`);

            const resultado = await ConsultarCertidaoService({
              clienteId: cliente.id,
              companyId,
              categoria
            });

            if (resultado.sucesso) {
              sucessosAgendamento++;
            } else {
              errosAgendamento++;
            }
          } catch (error: any) {
            console.error(`[ProcessarAgendamentos] Erro ao consultar ${categoria}:`, error.message);
            errosAgendamento++;
          }
        }

        // Aguardar intervalo configurado entre clientes para não sobrecarregar o portal (exceto no último)
        const isUltimoCliente = clienteIdx === agendamento.clienteIds.length - 1;
        if (!isUltimoCliente) {
          const intervaloMs = (agendamento.intervaloMinutos || 3) * 60 * 1000;
          console.log(`[ProcessarAgendamentos] Aguardando ${agendamento.intervaloMinutos || 3} min antes do próximo cliente...`);
          await sleep(intervaloMs);
        }
      }

      // Atualizar status do agendamento
      const statusFinal = errosAgendamento === 0 ? "concluido" : "erro";
      await agendamento.update({ status: statusFinal });

      processados++;
      sucessosTotais += sucessosAgendamento;
      errosTotais += errosAgendamento;

      detalhes.push({
        agendamentoId: agendamento.id,
        clienteNome: clientesProcessados.join(", "),
        certidoesProcessadas: sucessosAgendamento + errosAgendamento,
        status: statusFinal
      });

      console.log(`[ProcessarAgendamentos] Agendamento #${agendamento.id} concluído: ${sucessosAgendamento} sucessos, ${errosAgendamento} erros`);

    } catch (error: any) {
      console.error(`[ProcessarAgendamentos] Erro no agendamento #${agendamento.id}:`, error.message);
      await agendamento.update({ status: "erro" });
      errosTotais++;

      detalhes.push({
        agendamentoId: agendamento.id,
        clienteNome: "Erro",
        certidoesProcessadas: 0,
        status: "erro"
      });
    }
  }

  console.log(`[ProcessarAgendamentos] Finalizado: ${processados} agendamentos, ${sucessosTotais} sucessos, ${errosTotais} erros`);

  return {
    processados,
    sucessos: sucessosTotais,
    erros: errosTotais,
    detalhes
  };
};

export default ProcessarAgendamentosService;
