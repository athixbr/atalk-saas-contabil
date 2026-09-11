import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as WhatsappTemplateController from "../controllers/WhatsappTemplateController";
import * as WhatsappLogController from "../controllers/WhatsappLogController";
import * as WhatsappConnectionNotifController from "../controllers/WhatsappConnectionNotifController";

const whatsappNotifRoutes = Router();

// Conexões
whatsappNotifRoutes.get("/whatsapp-connections-notif", isAuth, WhatsappConnectionNotifController.index);
whatsappNotifRoutes.put("/whatsapp-connections-notif/:id/set-default", isAuth, WhatsappConnectionNotifController.setDefault);
whatsappNotifRoutes.put("/whatsapp-connections-notif/unset-default", isAuth, WhatsappConnectionNotifController.unsetDefault);

// Templates
whatsappNotifRoutes.get("/whatsapp-templates", isAuth, WhatsappTemplateController.index);
whatsappNotifRoutes.post("/whatsapp-templates", isAuth, WhatsappTemplateController.store);
whatsappNotifRoutes.put("/whatsapp-templates/:id", isAuth, WhatsappTemplateController.update);
whatsappNotifRoutes.delete("/whatsapp-templates/:id", isAuth, WhatsappTemplateController.remove);

// Logs
whatsappNotifRoutes.get("/whatsapp-logs", isAuth, WhatsappLogController.index);

export default whatsappNotifRoutes;
