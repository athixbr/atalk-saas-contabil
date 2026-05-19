import express from "express";
import isAuth from "../middleware/isAuth";
import * as ModeloParametrosController from "../controllers/ModeloParametrosController";

const modeloParametrosRoutes = express.Router();

// ========== ROTAS DE MODELOS DE PARÂMETROS ==========
modeloParametrosRoutes.get("/modelos-parametros", isAuth, ModeloParametrosController.index);
modeloParametrosRoutes.get("/modelos-parametros/:id", isAuth, ModeloParametrosController.show);
modeloParametrosRoutes.post("/modelos-parametros", isAuth, ModeloParametrosController.store);
modeloParametrosRoutes.put("/modelos-parametros/:id", isAuth, ModeloParametrosController.update);
modeloParametrosRoutes.delete("/modelos-parametros/:id", isAuth, ModeloParametrosController.remove);

export default modeloParametrosRoutes;
