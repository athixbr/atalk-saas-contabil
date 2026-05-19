/**
 * Controller para operações específicas de WWebJS
 * Importação de contatos e histórico
 */

import { Request, Response } from "express";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import { getIO } from "../libs/socket";
import { hasAdapter, getAdapter } from "../libs/adapterManager";
import ImportWWebJSContacts from "../services/WbotServices/ImportWWebJSContacts";
import Whatsapp from "../models/Whatsapp";
import { handleMessage as handleWWebJSMessage } from "../services/WbotServices/wbotMessageListener";

/**
 * Importa contatos do WhatsApp via WWebJS
 */
export const importContacts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  try {
    logger.info(`WWebJSController: Iniciando importação de contatos para whatsapp ${whatsappId}`);

    // Verifica se o whatsapp existe e é da empresa do usuário
    const whatsapp = await Whatsapp.findOne({
      where: {
        id: whatsappId,
        companyId
      }
    });

    if (!whatsapp) {
      throw new AppError("ERR_WAPP_NOT_FOUND", 404);
    }

    if (whatsapp.provider !== 'wwebjs') {
      throw new AppError("Este WhatsApp não usa WWebJS", 400);
    }

    if (!hasAdapter(parseInt(whatsappId))) {
      throw new AppError("WhatsApp não está conectado", 400);
    }

    // Emite evento de início
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-wwebjs-import`, {
        action: "started",
        whatsappId: whatsappId,
        type: "contacts"
      });

    // Inicia importação em background
    ImportWWebJSContacts(parseInt(whatsappId), companyId)
      .then((progress) => {
        logger.info(`WWebJSController: Importação de contatos concluída - ${progress.imported}/${progress.total}`);
        
        // Emite evento de conclusão
        io.to(`company-${companyId}-mainchannel`)
          .emit(`company-${companyId}-wwebjs-import`, {
            action: "completed",
            whatsappId: whatsappId,
            type: "contacts",
            progress
          });
      })
      .catch((error) => {
        logger.error(`WWebJSController: Erro na importação de contatos:`, error);
        
        // Emite evento de erro
        io.to(`company-${companyId}-mainchannel`)
          .emit(`company-${companyId}-wwebjs-import`, {
            action: "error",
            whatsappId: whatsappId,
            type: "contacts",
            error: error.message
          });
      });

    return res.json({
      message: "Importação de contatos iniciada em background",
      whatsappId: whatsappId
    });

  } catch (error) {
    logger.error(`WWebJSController: Erro ao importar contatos:`, error);
    throw new AppError(error.message || "Erro ao importar contatos");
  }
};

/**
 * Obtém lista de chats do WhatsApp
 */
export const getChats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  try {
    logger.info(`WWebJSController: Obtendo chats do whatsapp ${whatsappId}`);

    // Verifica se o whatsapp existe e é da empresa do usuário
    const whatsapp = await Whatsapp.findOne({
      where: {
        id: whatsappId,
        companyId
      }
    });

    if (!whatsapp) {
      throw new AppError("ERR_WAPP_NOT_FOUND", 404);
    }

    if (whatsapp.provider !== 'wwebjs') {
      throw new AppError("Este WhatsApp não usa WWebJS", 400);
    }

    if (!hasAdapter(parseInt(whatsappId))) {
      throw new AppError("WhatsApp não está conectado", 400);
    }

    const adapter = getAdapter(parseInt(whatsappId));
    const chats = await adapter.getAllChats();

    return res.json({
      chats: chats
    });

  } catch (error) {
    logger.error(`WWebJSController: Erro ao obter chats:`, error);
    throw new AppError(error.message || "Erro ao obter chats");
  }
};

/**
 * Importa mensagens de um chat específico
 */
export const importChatMessages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, chatId } = req.params;
  const { limit = 100 } = req.body;
  const { companyId } = req.user;

  try {
    logger.info(`WWebJSController: Importando mensagens do chat ${chatId} (whatsapp ${whatsappId})`);

    // Verifica se o whatsapp existe e é da empresa do usuário
    const whatsapp = await Whatsapp.findOne({
      where: {
        id: whatsappId,
        companyId
      }
    });

    if (!whatsapp) {
      throw new AppError("ERR_WAPP_NOT_FOUND", 404);
    }

    if (whatsapp.provider !== 'wwebjs') {
      throw new AppError("Este WhatsApp não usa WWebJS", 400);
    }

    if (!hasAdapter(parseInt(whatsappId))) {
      throw new AppError("WhatsApp não está conectado", 400);
    }

    const adapter = getAdapter(parseInt(whatsappId));
    const messages = await adapter.getChatMessages(chatId, limit);

    // Processa cada mensagem usando handleWWebJSMessage
    
    let imported = 0;
    for (const msg of messages) {
      try {
        await handleWWebJSMessage(msg, whatsapp as any, companyId);
        imported++;
      } catch (msgError) {
        logger.error(`WWebJSController: Erro ao processar mensagem ${msg.id}:`, msgError);
      }
    }

    logger.info(`WWebJSController: ${imported}/${messages.length} mensagens importadas`);

    return res.json({
      message: "Mensagens importadas com sucesso",
      total: messages.length,
      imported: imported
    });

  } catch (error) {
    logger.error(`WWebJSController: Erro ao importar mensagens:`, error);
    throw new AppError(error.message || "Erro ao importar mensagens");
  }
};
