import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as TipoServicoController from "../controllers/TipoServicoController";

const tipoServicoRoutes = Router();

tipoServicoRoutes.get("/tipo-servico", isAuth, TipoServicoController.index);
tipoServicoRoutes.get("/tipo-servico/:id", isAuth, TipoServicoController.show);
tipoServicoRoutes.post("/tipo-servico", isAuth, TipoServicoController.store);
tipoServicoRoutes.put("/tipo-servico/:id", isAuth, TipoServicoController.update);
tipoServicoRoutes.delete("/tipo-servico/:id", isAuth, TipoServicoController.remove);

export default tipoServicoRoutes;
