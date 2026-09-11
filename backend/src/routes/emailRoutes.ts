import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";
import uploadFilesToStorage from "../middleware/uploadToStorage";
import * as EmailConfigController from "../controllers/EmailConfigController";
import * as EmailTemplateController from "../controllers/EmailTemplateController";
import * as EmailLogController from "../controllers/EmailLogController";

const emailRoutes = Router();
const upload = multer(uploadConfig);

// Configurações de e-mail
emailRoutes.get("/email-configs", isAuth, EmailConfigController.index);
emailRoutes.post("/email-configs", isAuth, EmailConfigController.store);
emailRoutes.put("/email-configs/:id", isAuth, EmailConfigController.update);
emailRoutes.delete("/email-configs/:id", isAuth, EmailConfigController.remove);
emailRoutes.post("/email-configs/:id/send-test", isAuth, EmailConfigController.sendTest);

// Templates de e-mail
emailRoutes.get("/email-templates/variables", isAuth, EmailTemplateController.listVariables);
emailRoutes.post("/email-templates/upload-image", isAuth, upload.array("file"), uploadFilesToStorage, EmailTemplateController.uploadImage);
emailRoutes.get("/email-templates", isAuth, EmailTemplateController.index);
emailRoutes.post("/email-templates", isAuth, EmailTemplateController.store);
emailRoutes.put("/email-templates/:id", isAuth, EmailTemplateController.update);
emailRoutes.delete("/email-templates/:id", isAuth, EmailTemplateController.remove);
emailRoutes.post("/email-templates/:id/send-test", isAuth, EmailTemplateController.sendTest);

// Logs de e-mail
emailRoutes.get("/email-logs", isAuth, EmailLogController.index);

export default emailRoutes;
