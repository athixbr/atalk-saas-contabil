import TarefaRecorrente from "../models/TarefaRecorrente";
import TarefaRecorrenteCliente from "../models/TarefaRecorrenteCliente";
import TarefaRecorrenteSocio from "../models/TarefaRecorrenteSocio";
import TarefaGerada from "../models/TarefaGerada";
import TarefaGeradaHistorico from "../models/TarefaGeradaHistorico";
import Cliente from "../models/Cliente";
import Socio from "../models/Socio";
import Departamento from "../models/Departamento";
import { addDays, subDays, format, isSaturday, isSunday, getDaysInMonth } from "date-fns";
import {
  getNesimoDiaUtil,
  getUltimoDiaUtil,
  parseDiaUtilSentinela
} from "./TarefaRecorrenteService/businessDay";

interface GenerateTarefasParams {
  companyId?: number;
  tarefaRecorrenteId?: number;
  ano?: number;
  meses?: number[]; // Array de meses (1-12) para gerar
  clienteIds?: number[]; // Se especificado, gera só para esses clientes
}

interface TarefaGeradaResult {
  tarefasGeradas: number;
  tarefasPuladas: number;
  erros: string[];
}

class GenerateTarefasRecorrentesService {
  
  /**
   * Método principal que gera tarefas recorrentes em lote
   */
  async execute(params: GenerateTarefasParams = {}): Promise<TarefaGeradaResult> {
    console.log("🔄 Iniciando geração de tarefas recorrentes...", params);
    
    const resultado: TarefaGeradaResult = {
      tarefasGeradas: 0,
      tarefasPuladas: 0,
      erros: []
    };

    try {
      const { companyId, tarefaRecorrenteId, ano, meses, clienteIds } = params;
      const anoGeracao = ano || new Date().getFullYear();
      
      // Definir meses a gerar (padrão: todos)
      const mesesGerar = meses && meses.length > 0 ? meses : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

      // Buscar tarefas recorrentes ativas
      const where: any = { ativa: true };
      if (companyId) where.companyId = companyId;
      if (tarefaRecorrenteId) where.id = tarefaRecorrenteId;

      const tarefasRecorrentes = await TarefaRecorrente.findAll({
        where,
        include: [
          {
            model: Cliente,
            as: "clientes",
            through: { attributes: [] }
          },
          {
            model: Departamento,
            as: "departamento"
          }
        ]
      });

      console.log(`📋 Encontradas ${tarefasRecorrentes.length} tarefas recorrentes ativas`);

      for (const tarefaRecorrente of tarefasRecorrentes) {
        const entregasMensais = tarefaRecorrente.entregasMensais as any || {};

        // Para cada mês selecionado
        for (const mes of mesesGerar) {
          const diaEntregaRaw = entregasMensais[mes];

          if (
            diaEntregaRaw === "" ||
            diaEntregaRaw === null ||
            diaEntregaRaw === undefined ||
            diaEntregaRaw === "nao_tem"
          ) {
            console.log(`⏭️ Tarefa ${tarefaRecorrente.nomeTarefa}: sem dia configurado para mês ${mes}`);
            continue;
          }

          const diasNoMes = getDaysInMonth(new Date(anoGeracao, mes - 1));

          const sabadoUtil = !!tarefaRecorrente.sabadoUtil;
          const nDiaUtil = parseDiaUtilSentinela(diaEntregaRaw);

          // "ultimo" é o sentinela de "Último dia do mês": se ajusta sozinho
          // todo ano (28/29 em fevereiro conforme bissexto, 30/31 nos demais)
          let diaEntrega: number;
          if (diaEntregaRaw === "ultimo") {
            diaEntrega = diasNoMes;
          } else if (diaEntregaRaw === "ultimo_util") {
            diaEntrega = getUltimoDiaUtil(anoGeracao, mes, sabadoUtil);
          } else if (nDiaUtil !== null) {
            const dia = getNesimoDiaUtil(anoGeracao, mes, nDiaUtil, sabadoUtil);
            if (dia === null) {
              resultado.erros.push(`Tarefa "${tarefaRecorrente.nomeTarefa}": mês ${mes}/${anoGeracao} não possui ${nDiaUtil}º dia útil`);
              continue;
            }
            diaEntrega = dia;
          } else {
            diaEntrega = Number(diaEntregaRaw);
            if (Number.isNaN(diaEntrega) || diaEntrega < 1 || diaEntrega > diasNoMes) {
              // 29/02 é válido apenas em anos bissextos: em anos comuns não é
              // erro de configuração, apenas não há entrega naquele ano
              if (mes === 2 && diaEntrega === 29) {
                console.log(`⏭️ Tarefa ${tarefaRecorrente.nomeTarefa}: 29/02 não existe em ${anoGeracao} (ano não bissexto), pulando`);
              } else {
                resultado.erros.push(`Tarefa "${tarefaRecorrente.nomeTarefa}": dia ${diaEntregaRaw} inválido para mês ${mes}/${anoGeracao}`);
              }
              continue;
            }
          }

          console.log(`✅ Gerando tarefa: ${tarefaRecorrente.nomeTarefa} para ${diaEntrega}/${mes}/${anoGeracao}`);

          // Calcular datas baseado nas configurações
          const { dataInicio, dataEntrega, competencia } = this.calcularDatas(
            diaEntrega,
            mes,
            anoGeracao,
            tarefaRecorrente
          );

          // Filtrar clientes se especificado
          let clientesParaGerar = tarefaRecorrente.clientes || [];
          if (clienteIds && clienteIds.length > 0) {
            clientesParaGerar = clientesParaGerar.filter(c => clienteIds.includes(c.id));
          }

          if (clientesParaGerar.length === 0) {
            console.log(`⚠️ Nenhum cliente vinculado à tarefa ${tarefaRecorrente.nomeTarefa}`);
            resultado.tarefasPuladas++;
            continue;
          }

          // Gerar tarefas para cada cliente vinculado
          for (const cliente of clientesParaGerar) {
            try {
              // Verificar se já existe tarefa gerada para esse cliente nessa competência
              const tarefaExistente = await TarefaGerada.findOne({
                where: {
                  companyId: tarefaRecorrente.companyId,
                  tarefaRecorrenteId: tarefaRecorrente.id,
                  clienteId: cliente.id,
                  competencia
                }
              });

              if (tarefaExistente) {
                console.log(`⏭️ Tarefa já existe para cliente ${cliente.nome} - competência ${competencia}`);
                resultado.tarefasPuladas++;
                continue;
              }

              // Criar tarefa gerada
              const tarefaGerada = await TarefaGerada.create({
                companyId: tarefaRecorrente.companyId,
                tarefaRecorrenteId: tarefaRecorrente.id,
                clienteId: cliente.id,
                departamentoId: tarefaRecorrente.departamentoId,
                userId: tarefaRecorrente.usuarioResponsavelId || null,
                titulo: tarefaRecorrente.nomeTarefa,
                descricao: `${tarefaRecorrente.classificacao || ''} - Cliente: ${cliente.nome}`,
                status: "pendente",
                dataInicio,
                dataEntrega,
                competencia,
                checklistCompleto: null
              });

              // Registrar criação no histórico
              await TarefaGeradaHistorico.create({
                companyId: tarefaRecorrente.companyId,
                tarefaGeradaId: tarefaGerada.id,
                userId: null,
                acao: "criada_automaticamente",
                observacao: `Tarefa gerada automaticamente - Competência ${competencia} - Ano ${anoGeracao}`
              });

              resultado.tarefasGeradas++;
              
            } catch (error) {
              const errorMsg = `Erro ao gerar tarefa para cliente ${cliente.nome}: ${error.message}`;
              console.error(errorMsg);
              resultado.erros.push(errorMsg);
            }
          }
        }
      }

      console.log(`✅ Geração concluída!`, resultado);
      return resultado;
      
    } catch (error) {
      console.error("❌ Erro ao gerar tarefas recorrentes:", error);
      resultado.erros.push(`Erro fatal: ${error.message}`);
      return resultado;
    }
  }

  /**
   * Calcula as datas de início, entrega e competência baseado nas configs
   */
  private calcularDatas(
    diaEntrega: number,
    mesEntrega: number,
    anoEntrega: number,
    tarefa: any
  ) {
    // Data de entrega base
    let dataEntrega = new Date(anoEntrega, mesEntrega - 1, diaEntrega);

    const prazoFixo = tarefa.prazosFixos === "sim"
      ? "antecipar_dia_anterior"
      : tarefa.prazosFixos === "nao"
        ? "manter_dia_exato"
        : tarefa.prazosFixos;

    const isDiaNaoUtil = (data: Date) => {
      if (isSunday(data)) return true;
      return isSaturday(data) && !tarefa.sabadoUtil;
    };

    if (prazoFixo === "antecipar_dia_anterior") {
      while (isDiaNaoUtil(dataEntrega)) {
        dataEntrega = subDays(dataEntrega, 1);
      }
    } else if (prazoFixo === "postergar_proximo_dia_util") {
      while (isDiaNaoUtil(dataEntrega)) {
        dataEntrega = addDays(dataEntrega, 1);
      }
    }

    // Calcular data de início (pode ser implementado futuramente)
    const dataInicio = dataEntrega;

    // Calcular competência de referência
    const competencia = format(new Date(anoEntrega, mesEntrega - 1, 1), "MM/yyyy");
    return { dataInicio, dataEntrega, competencia };
  }

  /**
   * Verifica se deve gerar tarefa para o cliente baseado no filtro
   */
  private devereGerarParaCliente(gerarPara: string, cliente: any): boolean {
    if (gerarPara === "Matriz/Filial") return true;
    
    // Lógica para verificar se é matriz ou filial
    const ehMatriz = !cliente.contact?.codigoErp || cliente.contact?.codigoErp.endsWith("00");
    
    if (gerarPara === "Apenas Matriz") return ehMatriz;
    if (gerarPara === "Apenas Filial") return !ehMatriz;
    
    return true;
  }
}

export default GenerateTarefasRecorrentesService;
