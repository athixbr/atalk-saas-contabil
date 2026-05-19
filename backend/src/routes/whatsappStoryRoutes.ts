import express from "express";
import isAuth from "../middleware/isAuth";
import multer from "multer";

import * as WhatsappStoryController from "../controllers/WhatsappStoryController";

// Multer em memória para stories (buffer vai para DO Spaces)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

const routes = express.Router();

routes.get("/whatsapp-stories", isAuth, WhatsappStoryController.index);
routes.post("/whatsapp-stories/publish", isAuth, upload.single("media"), WhatsappStoryController.publish);
routes.put("/whatsapp-stories/:storyId/seen", isAuth, WhatsappStoryController.markSeen);

export default routes;
