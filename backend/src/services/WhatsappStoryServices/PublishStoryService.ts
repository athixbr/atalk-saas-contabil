import axios from "axios";
import Whatsapp from "../../models/Whatsapp";
import WhatsappStory from "../../models/WhatsappStory";
import AppError from "../../errors/AppError";
import DigitalOceanService from "../DigitalOceanService";

interface PublishStoryParams {
  companyId: number;
  whatsappId: number;
  mediaType: "text" | "image" | "video";
  textContent?: string;
  backgroundColor?: string;
  caption?: string;
  // Buffer da mídia (imagem ou vídeo) — opcional
  mediaBuffer?: Buffer;
  mediaFileName?: string;
  mediaMimeType?: string;
  // Lista de JIDs que podem ver o story (vazio = todos os contatos)
  statusJidList?: string[];
}

const BAILEYS_SERVICE_URL = process.env.BAILEYS_2026_URL || process.env.BAILEYS_SERVICE_URL || "http://127.0.0.1:8081";

const PublishStoryService = async (params: PublishStoryParams): Promise<WhatsappStory> => {
  const {
    companyId,
    whatsappId,
    mediaType,
    textContent,
    backgroundColor,
    caption,
    mediaBuffer,
    mediaFileName,
    mediaMimeType,
    statusJidList = []
  } = params;

  const whatsapp = await Whatsapp.findOne({ where: { id: whatsappId, companyId } });
  if (!whatsapp) throw new AppError("Conexão WhatsApp não encontrada", 404);

  if (whatsapp.provider !== "baileys2026" && whatsapp.provider !== "whatsapp2026") {
    throw new AppError("Esta conexão não suporta publicação de stories (requer Baileys 2026)", 400);
  }

  let mediaUrl: string | undefined;
  let mediaPath: string | undefined;

  // Upload de mídia para o DO Spaces se houver arquivo
  if (mediaBuffer && mediaFileName) {
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
  }

  // Monta payload para o serviço Baileys
  const payload: any = {
    whatsappId,
    mediaType,
    statusJidList
  };

  if (mediaType === "text") {
    payload.text = textContent;
    payload.backgroundColor = backgroundColor;
  } else {
    payload.mediaUrl = mediaUrl;
    payload.caption = caption;
    payload.mimeType = mediaMimeType;
  }

  // Envia para o microserviço Baileys
  const response = await axios.post(`${BAILEYS_SERVICE_URL}/story/publish`, payload, {
    timeout: 30000
  });

  if (!response.data?.success) {
    throw new AppError("Falha ao publicar story no WhatsApp: " + (response.data?.error || "erro desconhecido"), 500);
  }

  // Salva o story publicado no banco
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const story = await WhatsappStory.create({
    companyId,
    whatsappId,
    senderJid: whatsapp.number + "@s.whatsapp.net",
    senderName: whatsapp.name,
    mediaType,
    textContent: textContent || null,
    caption: caption || null,
    mediaPath: mediaPath || null,
    mediaUrl: mediaUrl || null,
    backgroundColor: backgroundColor || null,
    messageId: response.data?.messageId || null,
    expiresAt,
    direction: "sent"
  });

  return story;
};

export default PublishStoryService;
