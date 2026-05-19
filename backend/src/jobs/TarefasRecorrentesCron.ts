import { CronJob } from "cron";
import GenerateTarefasRecorrentesService from "../services/GenerateTarefasRecorrentesService";

class TarefasRecorrentesCron {
  private job: CronJob;

  constructor() {
    // Executa todos os dias às 00:00 (meia-noite)
    this.job = new CronJob(
      "0 0 * * *", // Cron expression: segundo minuto hora dia mês dia-semana
      async () => {
        console.log("🕐 [CRON] Executando geração de tarefas recorrentes às", new Date());
        
        try {
          const service = new GenerateTarefasRecorrentesService();
          await service.execute();
          console.log("✅ [CRON] Geração de tarefas concluída com sucesso");
        } catch (error) {
          console.error("❌ [CRON] Erro na geração de tarefas:", error);
        }
      },
      null, // onComplete
      false, // start
      "America/Sao_Paulo" // timezone
    );
  }

  /**
   * Inicia o job
   */
  start(): void {
    console.log("🚀 [CRON] Iniciando job de tarefas recorrentes (00:00 diariamente)");
    this.job.start();
  }

  /**
   * Para o job
   */
  stop(): void {
    console.log("🛑 [CRON] Parando job de tarefas recorrentes");
    this.job.stop();
  }

  /**
   * Executa manualmente (para testes)
   */
  async executeNow(): Promise<void> {
    console.log("🔄 [CRON] Executando job manualmente");
    
    try {
      const service = new GenerateTarefasRecorrentesService();
      await service.execute();
      console.log("✅ [CRON] Execução manual concluída com sucesso");
    } catch (error) {
      console.error("❌ [CRON] Erro na execução manual:", error);
      throw error;
    }
  }
}

export default TarefasRecorrentesCron;
