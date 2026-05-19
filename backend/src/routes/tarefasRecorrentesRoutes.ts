import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as TarefasRecorrentesController from "../controllers/TarefasRecorrentesController";

const tarefasRecorrentesRoutes = Router();

tarefasRecorrentesRoutes.get("/tarefas-recorrentes", isAuth, TarefasRecorrentesController.index);
tarefasRecorrentesRoutes.get("/tarefas-recorrentes/:id", isAuth, TarefasRecorrentesController.show);
tarefasRecorrentesRoutes.post("/tarefas-recorrentes", isAuth, TarefasRecorrentesController.store);
tarefasRecorrentesRoutes.put("/tarefas-recorrentes/:id", isAuth, TarefasRecorrentesController.update);
tarefasRecorrentesRoutes.delete("/tarefas-recorrentes/:id", isAuth, TarefasRecorrentesController.remove);

export default tarefasRecorrentesRoutes;
