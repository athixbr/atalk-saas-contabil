import Ticket from "../../models/Ticket";
import TicketMetrics from "../../models/TicketMetrics";
import TicketUserMetrics from "../../models/TicketUserMetrics";
import TicketTraking from "../../models/TicketTraking";
import moment from "moment";

const PopulateTicketMetricsService = async (): Promise<void> => {
  console.log("🔄 Iniciando população das métricas de tickets...");

  // Busca todos os tickets
  const tickets = await Ticket.findAll();

  console.log(`📊 Encontrados ${tickets.length} tickets para processar`);

  let created = 0;
  let updated = 0;

  for (const ticket of tickets) {
    try {
      // Verifica se já existe métrica
      let metric = await TicketMetrics.findOne({
        where: { ticketId: ticket.id }
      });

      const ticketData: any = {
        ticketId: ticket.id,
        companyId: ticket.companyId,
        createdAt: ticket.createdAt,
        status: ticket.status
      };

      // Busca tracking deste ticket
      const trackings = await TicketTraking.findAll({
        where: { ticketId: ticket.id },
        order: [["createdAt", "ASC"]]
      });

      // Calcula tempos se ticket tiver tracking
      if (trackings && trackings.length > 0) {
        const firstTracking = trackings[0];

        // Tempo de espera inicial
        if (firstTracking.startedAt) {
          const tempoEspera = moment(firstTracking.startedAt).diff(
            moment(ticket.createdAt),
            "seconds"
          );
          ticketData.firstResponseAt = firstTracking.startedAt;
          ticketData.tempoEsperaInicial = tempoEspera > 0 ? tempoEspera : 0;
        }

        // Se ticket foi fechado
        if (ticket.status === "closed" && firstTracking.closedAt) {
          const tempoTotal = moment(firstTracking.closedAt).diff(
            moment(ticket.createdAt),
            "seconds"
          );
          ticketData.closedAt = firstTracking.closedAt;
          ticketData.tempoTotalAtendimento = tempoTotal > 0 ? tempoTotal : 0;
        }
      }

      if (metric) {
        await metric.update(ticketData);
        updated++;
      } else {
        await TicketMetrics.create(ticketData);
        created++;
      }

      // Cria métricas de usuário se houver tracking
      if (trackings && trackings.length > 0) {
        for (let i = 0; i < trackings.length; i++) {
          const tracking = trackings[i];
          
          if (!tracking.userId) continue;

          // Busca métrica geral
          const ticketMetric = await TicketMetrics.findOne({
            where: { ticketId: ticket.id }
          });

          if (!ticketMetric) continue;

          // Verifica se já existe
          const existingUserMetric = await TicketUserMetrics.findOne({
            where: {
              ticketId: ticket.id,
              userId: tracking.userId,
              startedAt: tracking.startedAt
            }
          });

          if (existingUserMetric) continue;

          const userMetricData: any = {
            ticketId: ticket.id,
            ticketMetricId: ticketMetric.id,
            userId: tracking.userId,
            companyId: ticket.companyId,
            queueId: tracking.queueId,
            startedAt: tracking.startedAt || tracking.createdAt,
            order: i + 1
          };

          // Se tiver finishedAt
          if (tracking.finishedAt) {
            const tempoTotal = moment(tracking.finishedAt).diff(
              moment(tracking.startedAt || tracking.createdAt),
              "seconds"
            );
            userMetricData.finishedAt = tracking.finishedAt;
            userMetricData.tempoTotal = tempoTotal > 0 ? tempoTotal : 0;
          }

          // Se é o último e ticket está fechado
          if (i === trackings.length - 1 && ticket.status === "closed") {
            userMetricData.finalizouTicket = true;
          }

          await TicketUserMetrics.create(userMetricData);
        }
      }
    } catch (error) {
      console.error(`❌ Erro ao processar ticket ${ticket.id}:`, error);
    }
  }

  console.log(`✅ População concluída!`);
  console.log(`   📝 Criados: ${created}`);
  console.log(`   🔄 Atualizados: ${updated}`);
};

export default PopulateTicketMetricsService;
