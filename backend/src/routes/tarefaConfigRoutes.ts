import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as TarefaConfigController from "../controllers/TarefaConfigController";

const tarefaConfigRoutes = Router();

tarefaConfigRoutes.get("/tarefas-config", isAuth, TarefaConfigController.index);
tarefaConfigRoutes.get("/tarefas-config/:tarefaConfigId", isAuth, TarefaConfigController.show);
tarefaConfigRoutes.post("/tarefas-config", isAuth, TarefaConfigController.store);
tarefaConfigRoutes.put("/tarefas-config/:tarefaConfigId", isAuth, TarefaConfigController.update);
tarefaConfigRoutes.delete("/tarefas-config/:tarefaConfigId", isAuth, TarefaConfigController.remove);

export default tarefaConfigRoutes;
