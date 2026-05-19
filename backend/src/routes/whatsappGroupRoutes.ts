import express from "express";
import isAuth from "../middleware/isAuth";

import * as WhatsappGroupController from "../controllers/WhatsappGroupController";

const routes = express.Router();

routes.get("/whatsapp-groups", isAuth, WhatsappGroupController.index);
routes.post("/whatsapp-groups/sync", isAuth, WhatsappGroupController.sync);

export default routes;
