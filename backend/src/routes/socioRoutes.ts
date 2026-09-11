import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as SocioController from "../controllers/SocioController";

const socioRoutes = Router();

// Rotas de CRUD de Sócios
socioRoutes.get("/socios", isAuth, SocioController.index);
socioRoutes.get("/socios/proximo-codigo-sistema", isAuth, SocioController.nextCodigoSistema);
socioRoutes.get("/socios/:socioId", isAuth, SocioController.show);
socioRoutes.post("/socios", isAuth, SocioController.store);
socioRoutes.put("/socios/:socioId", isAuth, SocioController.update);
socioRoutes.delete("/socios/:socioId", isAuth, SocioController.remove);

// Rotas de Gestão de Vínculos (Sócio ↔ Cliente/Empresa)
socioRoutes.post("/socios/vinculos", isAuth, SocioController.vincular);
socioRoutes.put("/socios/vinculos/:vinculoId", isAuth, SocioController.updateVinculo);
socioRoutes.delete("/socios/vinculos/:vinculoId", isAuth, SocioController.removeVinculo);

export default socioRoutes;
