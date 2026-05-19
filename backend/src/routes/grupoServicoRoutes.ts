import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as GrupoServicoController from "../controllers/GrupoServicoController";

const grupoServicoRoutes = Router();

grupoServicoRoutes.get("/grupo-servico", isAuth, GrupoServicoController.index);
grupoServicoRoutes.get("/grupo-servico/:id", isAuth, GrupoServicoController.show);
grupoServicoRoutes.post("/grupo-servico", isAuth, GrupoServicoController.store);
grupoServicoRoutes.put("/grupo-servico/:id", isAuth, GrupoServicoController.update);
grupoServicoRoutes.delete("/grupo-servico/:id", isAuth, GrupoServicoController.remove);

export default grupoServicoRoutes;
