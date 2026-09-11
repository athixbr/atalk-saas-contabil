import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as TarefasGeradasController from "../controllers/TarefasGeradasController";

const tarefasGeradasRoutes = Router();

// Central de Atividades
tarefasGeradasRoutes.get("/tarefas-geradas", isAuth, TarefasGeradasController.index);
tarefasGeradasRoutes.get("/tarefas-geradas/statistics", isAuth, TarefasGeradasController.getStatistics);
tarefasGeradasRoutes.get("/tarefas-geradas/:id", isAuth, TarefasGeradasController.show);
tarefasGeradasRoutes.put("/tarefas-geradas/:id/status", isAuth, TarefasGeradasController.updateStatus);
tarefasGeradasRoutes.put("/tarefas-geradas/:id/reatribuir", isAuth, TarefasGeradasController.reatribuir);
tarefasGeradasRoutes.put("/tarefas-geradas/:id/checklist", isAuth, TarefasGeradasController.updateChecklist);
tarefasGeradasRoutes.get("/tarefas-geradas/:id/historico", isAuth, TarefasGeradasController.getHistorico);

// Geração e Gerenciamento em Lote
tarefasGeradasRoutes.post("/tarefas-geradas/gerar-lote", isAuth, TarefasGeradasController.gerarLote);
tarefasGeradasRoutes.delete("/tarefas-geradas/:id", isAuth, TarefasGeradasController.excluirAvulsa);
tarefasGeradasRoutes.post("/tarefas-geradas/excluir-lote", isAuth, TarefasGeradasController.excluirLote);
tarefasGeradasRoutes.post("/tarefas-geradas/pausar-lote", isAuth, TarefasGeradasController.pausarLote);
tarefasGeradasRoutes.get("/tarefas-recorrentes/com-geradas", isAuth, TarefasGeradasController.listarRecorrentesComGeradas);

export default tarefasGeradasRoutes;
