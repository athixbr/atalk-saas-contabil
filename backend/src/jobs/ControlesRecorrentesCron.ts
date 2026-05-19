import { CronJob } from "cron";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import ControleCliente from "../models/ControleCliente";
import ControleConfig from "../models/ControleConfig";
import GerarTarefasControleService from "../services/ControleClienteServices/GerarTarefasControleService";
import ControleNotificacao from "../models/ControleNotificacao";
import { getIO } from "../libs/socket";

/**
 * CRON para processar controles recorrentes
 * Executa todos os dias às 02:00
 * 
 * - Gera tarefas para controles recorrentes que ainda não possuem tarefas
 * - Notifica sobre vencimentos próximos (7 dias antes)
 * - Notifica sobre controles vencidos
 */
const ControlesRecorrentesCron = new CronJob(
  "0 2 * * *", // Executa às 02:00 todos os dias
  async () => {
    console.log("[CRON] Iniciando processamento de controles recorrentes...");

    try {
      // 1. Buscar controles recorrentes ativos
      const vinculosRecorrentes = await ControleCliente.findAll({
        where: {
          ativo: true,
        },
        include: [
          {
            model: ControleConfig,
            as: "controleConfig",
            where: {
              recorrente: true,
            },
            required: true,
          },
          { association: "cliente" },
        ],
      });

      console.log(`[CRON] Encontrados ${vinculosRecorrentes.length} vínculos recorrentes ativos`);

      let tarefasGeradasTotal = 0;

      // 2. Processar cada vínculo
      for (const vinculo of vinculosRecorrentes) {
        try {
          const resultado = await GerarTarefasControleService({
            controleClienteId: vinculo.id,
            companyId: vinculo.controleConfig!.companyId,
            forcarRegeneracao: false, // Não forçar, apenas gerar se não existir
          });

          tarefasGeradasTotal += resultado.tarefasGeradas;

          if (resultado.tarefasGeradas > 0) {
            console.log(
              `[CRON] Geradas ${resultado.tarefasGeradas} tarefas para vínculo ${vinculo.id} (Cliente: ${vinculo.cliente?.nome})`
            );
          }
        } catch (error) {
          console.error(`[CRON] Erro ao processar vínculo ${vinculo.id}:`, error);
        }
      }

      console.log(`[CRON] Total de tarefas geradas: ${tarefasGeradasTotal}`);

      // 3. Notificar sobre vencimentos próximos (7 dias)
      const dataHoje = new Date();
      dataHoje.setHours(0, 0, 0, 0);
      const data7Dias = new Date();
      data7Dias.setDate(data7Dias.getDate() + 7);
      data7Dias.setHours(23, 59, 59, 999);

      const vinculosVencendo = await ControleCliente.findAll({
        where: {
          ativo: true,
          dataFim: {
            [Op.gte]: dataHoje,
            [Op.lte]: data7Dias,
          },
        },
        include: [
          { association: "controleConfig" },
          { association: "cliente" },
        ],
      });

      console.log(`[CRON] Encontrados ${vinculosVencendo.length} controles vencendo em 7 dias`);

      for (const vinculo of vinculosVencendo) {
        try {
          // Verificar se já existe notificação de lembrete criada hoje
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);

          const notificacaoExistente = await ControleNotificacao.findOne({
            where: {
              controleClienteId: vinculo.id,
              tipo: "lembrete",
              createdAt: {
                [Op.gte]: hoje,
              },
            },
          });

          if (!notificacaoExistente) {
            const diasRestantes = Math.ceil(
              (new Date(vinculo.dataFim!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            const notificacao = await ControleNotificacao.create({
              controleClienteId: vinculo.id,
              controleConfigId: vinculo.controleConfigId,
              clienteId: vinculo.clienteId,
              tipo: "lembrete",
              titulo: "Controle Vencendo em Breve",
              mensagem: `O controle "${vinculo.controleConfig?.nome}" para o cliente "${vinculo.cliente?.nome}" vence em ${diasRestantes} dias (${new Date(vinculo.dataFim!).toLocaleDateString("pt-BR")})`,
              departamentoId: vinculo.departamentoId,
              usuarioId: vinculo.usuarioId,
              lida: false,
              metadata: {
                diasRestantes,
                dataFim: vinculo.dataFim,
                link: `/controles-vinculos/${vinculo.id}`,
              },
              companyId: vinculo.controleConfig!.companyId,
            });

            // Emitir notificação via Socket.IO
            const io = getIO();
            const companyId = vinculo.controleConfig!.companyId;

            if (vinculo.departamentoId) {
              io.emit(`company-${companyId}-department-${vinculo.departamentoId}-notification`, {
                action: "new",
                notificacao,
              });
            }

            if (vinculo.usuarioId) {
              io.emit(`company-${companyId}-user-${vinculo.usuarioId}-notification`, {
                action: "new",
                notificacao,
              });
            }

            console.log(`[CRON] Notificação de vencimento criada para vínculo ${vinculo.id}`);
          }
        } catch (error) {
          console.error(`[CRON] Erro ao notificar vencimento do vínculo ${vinculo.id}:`, error);
        }
      }

      // 4. Notificar sobre controles vencidos
      const vinculosVencidos = await ControleCliente.findAll({
        where: {
          ativo: true,
          dataFim: {
            [Op.lt]: new Date(),
          },
        },
        include: [
          { association: "controleConfig" },
          { association: "cliente" },
        ],
      });

      console.log(`[CRON] Encontrados ${vinculosVencidos.length} controles vencidos`);

      for (const vinculo of vinculosVencidos) {
        try {
          // Verificar se já existe notificação de vencimento criada hoje
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);

          const notificacaoExistente = await ControleNotificacao.findOne({
            where: {
              controleClienteId: vinculo.id,
              tipo: "vencimento",
              createdAt: {
                [Op.gte]: hoje,
              },
            },
          });

          if (!notificacaoExistente) {
            const diasVencidos = Math.ceil(
              (new Date().getTime() - new Date(vinculo.dataFim!).getTime()) / (1000 * 60 * 60 * 24)
            );

            const notificacao = await ControleNotificacao.create({
              controleClienteId: vinculo.id,
              controleConfigId: vinculo.controleConfigId,
              clienteId: vinculo.clienteId,
              tipo: "vencimento",
              titulo: "Controle Vencido",
              mensagem: `O controle "${vinculo.controleConfig?.nome}" para o cliente "${vinculo.cliente?.nome}" está vencido há ${diasVencidos} dias (venceu em ${new Date(vinculo.dataFim!).toLocaleDateString("pt-BR")})`,
              departamentoId: vinculo.departamentoId,
              usuarioId: vinculo.usuarioId,
              lida: false,
              metadata: {
                diasVencidos,
                dataFim: vinculo.dataFim,
                link: `/controles-vinculos/${vinculo.id}`,
              },
              companyId: vinculo.controleConfig!.companyId,
            });

            // Emitir notificação via Socket.IO
            const io = getIO();
            const companyId = vinculo.controleConfig!.companyId;

            if (vinculo.departamentoId) {
              io.emit(`company-${companyId}-department-${vinculo.departamentoId}-notification`, {
                action: "new",
                notificacao,
              });
            }

            if (vinculo.usuarioId) {
              io.emit(`company-${companyId}-user-${vinculo.usuarioId}-notification`, {
                action: "new",
                notificacao,
              });
            }

            console.log(`[CRON] Notificação de vencido criada para vínculo ${vinculo.id}`);
          }
        } catch (error) {
          console.error(`[CRON] Erro ao notificar vencimento do vínculo ${vinculo.id}:`, error);
        }
      }

      console.log("[CRON] Processamento de controles recorrentes concluído!");
    } catch (error) {
      console.error("[CRON] Erro ao processar controles recorrentes:", error);
    }
  },
  null, // onComplete
  false, // start
  "America/Sao_Paulo" // timezone
);

export default ControlesRecorrentesCron;
