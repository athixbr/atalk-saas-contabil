import express from "express";
import isAuth from "../middleware/isAuth";
import multer from "multer";
import uploadConfig from "../config/upload";

import * as CampaignGrupoController from "../controllers/CampaignGrupoController";

const upload = multer(uploadConfig);
const routes = express.Router();

// Rotas específicas ANTES de rotas com parâmetros
routes.get("/campaign-grupos/config", isAuth, CampaignGrupoController.getConfig);
routes.post("/campaign-grupos/config", isAuth, CampaignGrupoController.updateConfig);
routes.get("/campaign-grupos", isAuth, CampaignGrupoController.index);
routes.post("/campaign-grupos", isAuth, CampaignGrupoController.store);

// Rotas com ações específicas ANTES de :id genérico
routes.post("/campaign-grupos/:id/cancel", isAuth, CampaignGrupoController.cancel);
routes.post("/campaign-grupos/:id/restart", isAuth, CampaignGrupoController.restart);
routes.post("/campaign-grupos/:id/process", isAuth, CampaignGrupoController.process);
routes.post("/campaign-grupos/:id/media", isAuth, upload.array("file"), CampaignGrupoController.mediaUpload);
routes.delete("/campaign-grupos/:id/media", isAuth, CampaignGrupoController.mediaDelete);

// Rotas genéricas com :id por último
routes.get("/campaign-grupos/:id", isAuth, CampaignGrupoController.show);
routes.put("/campaign-grupos/:id", isAuth, CampaignGrupoController.update);
routes.delete("/campaign-grupos/:id", isAuth, CampaignGrupoController.remove);

export default routes;
