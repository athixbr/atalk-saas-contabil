/**
 * Rotas específicas para WWebJS
 * Importação de contatos e histórico
 */

import express from "express";
import isAuth from "../middleware/isAuth";
import * as WWebJSController from "../controllers/WWebJSController";

const wwebjsRoutes = express.Router();

/**
 * POST /wwebjs/:whatsappId/import-contacts
 * Importa contatos do WhatsApp
 */
wwebjsRoutes.post(
  "/wwebjs/:whatsappId/import-contacts",
  isAuth,
  WWebJSController.importContacts
);

/**
 * GET /wwebjs/:whatsappId/chats
 * Lista todos os chats do WhatsApp
 */
wwebjsRoutes.get(
  "/wwebjs/:whatsappId/chats",
  isAuth,
  WWebJSController.getChats
);

/**
 * POST /wwebjs/:whatsappId/import-messages/:chatId
 * Importa mensagens de um chat específico
 */
wwebjsRoutes.post(
  "/wwebjs/:whatsappId/import-messages/:chatId",
  isAuth,
  WWebJSController.importChatMessages
);

export default wwebjsRoutes;
