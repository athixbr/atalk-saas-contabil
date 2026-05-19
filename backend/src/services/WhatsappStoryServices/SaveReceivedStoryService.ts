import WhatsappStory from "../../models/WhatsappStory";
import DigitalOceanService from "../DigitalOceanService";
import { logger } from "../../utils/logger";

interface SaveReceivedStoryParams {
  companyId: number;
  whatsappId: number;
  senderJid: string;
  senderName?: string;
  senderProfilePic?: string;
  mediaType: string;
  textContent?: string;
  caption?: string;
  backgroundColor?: string;
  messageId?: string;
  // Buffer da mídia recebida (baixado do WhatsApp)
  mediaBuffer?: Buffer;
  mediaFileName?: string;
  mediaMimeType?: string;
}

const SaveReceivedStoryService = async (params: SaveReceivedStoryParams): Promise<WhatsappStory | null> => {
  const {
    companyId,
    whatsappId,
    senderJid,
    senderName,
    senderProfilePic,
    mediaType,
    textContent,
    caption,
    backgroundColor,
    messageId,
    mediaBuffer,
    mediaFileName,
    mediaMimeType
  } = params;

  // Evitar duplicatas pelo messageId
  if (messageId) {
    const existing = await WhatsappStory.findOne({ where: { messageId, companyId } });
    if (existing) return existing;
  }

  let mediaUrl: string | undefined;
  let mediaPath: string | undefined;

  // Faz upload da mídia recebida para o DO Spaces
  if (mediaBuffer && mediaFileName) {
    try {
      const doService = new DigitalOceanService();
      const uploaded = await doService.upload({
        companyId,
        folder: "stories",
        file: mediaBuffer,
        fileName: mediaFileName,
        isPublic: true
      });
      mediaUrl = uploaded.url;
      mediaPath = uploaded.path;
    } catch (err) {
      logger.error("Erro ao fazer upload de mídia de story para DO Spaces:", err);
    }
  }

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const story = await WhatsappStory.create({
    companyId,
    whatsappId,
    senderJid,
    senderName: senderName || null,
    senderProfilePic: senderProfilePic || null,
    mediaType,
    textContent: textContent || null,
    caption: caption || null,
    mediaPath: mediaPath || null,
    mediaUrl: mediaUrl || null,
    backgroundColor: backgroundColor || null,
    messageId: messageId || null,
    expiresAt,
    direction: "received"
  });

  return story;
};

export default SaveReceivedStoryService;
