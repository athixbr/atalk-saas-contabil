import "../bootstrap";
import "../database";
import PopulateTicketMetricsService from "../services/TicketMetricsServices/PopulateTicketMetricsService";

const run = async (): Promise<void> => {
  try {
    console.log("🚀 Iniciando população das métricas...\n");
    await PopulateTicketMetricsService();
    console.log("\n✅ Processo concluído com sucesso!");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Erro ao popular métricas:", error);
    process.exit(1);
  }
};

run();
