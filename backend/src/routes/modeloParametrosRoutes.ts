import express from "express";
import isAuth from "../middleware/isAuth";
import * as ModeloParametrosController from "../controllers/ModeloParametrosController";
import * as EndpointsController from "../controllers/EndpointsController";

const modeloParametrosRoutes = express.Router();

// ========== ROTAS DE MODELOS DE PARÂMETROS ==========
modeloParametrosRoutes.get("/modelos-parametros", isAuth, ModeloParametrosController.index);
modeloParametrosRoutes.get("/modelos-parametros/:id", isAuth, ModeloParametrosController.show);
modeloParametrosRoutes.post("/modelos-parametros", isAuth, ModeloParametrosController.store);
modeloParametrosRoutes.put("/modelos-parametros/:id", isAuth, ModeloParametrosController.update);
modeloParametrosRoutes.delete("/modelos-parametros/:id", isAuth, ModeloParametrosController.remove);

// Endpoints disponíveis (lista unificada de controles, recorrências, tarefas, parcelamentos)
modeloParametrosRoutes.get("/endpoints-disponiveis", isAuth, EndpointsController.indexDisponiveis);

// Endpoints vinculados a um modelo
modeloParametrosRoutes.get("/modelos-parametros/:modeloId/endpoints", isAuth, EndpointsController.indexModelo);
modeloParametrosRoutes.put("/modelos-parametros/:modeloId/endpoints", isAuth, EndpointsController.salvarModelo);

export default modeloParametrosRoutes;
