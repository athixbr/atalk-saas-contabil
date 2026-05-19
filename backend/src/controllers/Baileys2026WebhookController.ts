import { Request, Response } from "express";
import Whatsapp from "../models/Whatsapp";
import { AdapterFactory } from "../adapters/AdapterFactory";
import { Baileys2026Adapter } from "../adapters/Baileys2026Adapter";
import { logger } from "../utils/logger";
import { getIO } from "../libs/socket";
import SaveReceivedStoryService from "../services/WhatsappStoryServices/SaveReceivedStoryService";

export const baileys2026Webhook = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { whatsappId } = req.params;
    const { event, data } = req.body;

    logger.info(`Webhook Baileys2026 recebido para whatsapp ${whatsappId}: ${event}`);

    const whatsapp = await Whatsapp.findByPk(whatsappId);

    if (!whatsapp) {
      return res.status(404).json({ error: "Whatsapp não encontrado" });
    }

    if (whatsapp.provider !== 'baileys2026' && whatsapp.provider !== 'whatsapp2026') {
      return res.status(400).json({ error: "Whatsapp não é Baileys 2026" });
    }

    const io = getIO();

    // Processa eventos
    switch (event) {
      case 'qrcode':
        // Atualiza QR Code no banco
        await whatsapp.update({
          qrcode: data.qrcode,
          status: 'QRCODE'
        });

        // Envia via socket para frontend
        io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
          action: 'update',
          session: whatsapp
        });
        break;

      case 'status':
        // Atualiza status no banco
        await whatsapp.update({
          status: data.status
        });

        // Envia via socket para frontend
        io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
          action: 'update',
          session: whatsapp
        });
        break;

      case 'message':
        // Processa mensagem recebida
        // Aqui você pode chamar o wbotMessageListener ou processar diretamente
        logger.info(`Mensagem recebida de ${data.from}`);
        
        // TODO: Integrar com wbotMessageListener ou criar handler específico
        // const { wbotMessageListener } = await import("../services/WbotServices/wbotMessageListener");
        // await wbotMessageListener(data, whatsapp.companyId);
        break;

      case 'story':
        // Story recebido de um contato (status@broadcast)
        logger.info(`Story recebido de ${data.senderJid} para whatsapp ${whatsappId}`);
        try {
          const story = await SaveReceivedStoryService({
            companyId: whatsapp.companyId,
            whatsappId: whatsapp.id,
            senderJid: data.senderJid,
            senderName: data.senderName || null,
            senderProfilePic: data.senderProfilePic || null,
            mediaType: data.mediaType || "text",
            textContent: data.textContent || null,
            caption: data.caption || null,
            backgroundColor: data.backgroundColor || null,
            messageId: data.messageId || null
          });

          if (story) {
            // Notifica o frontend via socket
            io.emit(`company-${whatsapp.companyId}-story`, {
              action: "new",
              story
            });
          }
        } catch (storyError) {
          logger.error(`Erro ao salvar story recebido:`, storyError);
        }
        break;
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error(`Erro no webhook Baileys2026:`, error);
    return res.status(500).json({ error: "Erro ao processar webhook" });
  }
};
