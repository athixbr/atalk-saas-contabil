import { WAMessage, AnyMessageContent } from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";
import fs, { unlink, unlinkSync } from "fs";
import { exec } from "child_process";
import path from "path";
import os from "os";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";
import mime from "mime-types";
import Contact from "../../models/Contact";
import { getWbot } from "../../libs/wbot";
import CreateMessageService from "../MessageServices/CreateMessageService";
import formatBody from "../../helpers/Mustache";
import { ensureLocalFile, isSpacesUrl, cdnUrlToKey } from "../../helpers/uploadToSpaces";
interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  companyId?: number;
  body?: string;
  isPrivate?: boolean;
  isForwarded?: boolean;
}

const publicFolder = path.resolve(__dirname, "..", "..", "..", "..", "public");

const processAudio = async (audio: string, companyId: string): Promise<string> => {
  const outputAudio = path.join(os.tmpdir(), `atalk-audio-${new Date().getTime()}.mp3`);
  
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath.path} -i "${audio}" -vn -ab 128k -ar 44100 -f ipod ${outputAudio} -y`,
      (error, _stdout, _stderr) => {
        if (error) reject(error);
        resolve(outputAudio);
      }
    );
  });
};

const processAudioFile = async (audio: string, companyId: string): Promise<string> => {
  const outputAudio = path.join(os.tmpdir(), `atalk-audiof-${new Date().getTime()}.mp3`);
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath.path} -i "${audio}" -vn -ar 44100 -ac 2 -b:a 192k "${outputAudio}"`,
      (error, _stdout, _stderr) => {
        if (error) reject(error);
        resolve(outputAudio);
      }
    );
  });
};

export const getMessageOptions = async (
  fileName: string,
  pathMedia: string,
  companyId?: string,
  body?: string
): Promise<any> => {
  const mimeType = mime.lookup(pathMedia);
  const typeMessage = mimeType.split("/")[0];
  

  try {
    if (!mimeType) {
      throw new Error("Invalid mimetype");
    }
    let options: AnyMessageContent;

    if (typeMessage === "video") {
      options = {
        video: fs.readFileSync(pathMedia),
        caption: body ? body: null,
        fileName: fileName
        // gifPlayback: true
      };
    } else if (typeMessage === "audio") {
      const typeAudio = true; //fileName.includes("audio-record-site");
      const convert = await processAudio(pathMedia, companyId);
      
      if (typeAudio) {
        options = {
          audio: fs.readFileSync(convert),
          mimetype: "audio/mp4",
          ptt: true
        };
      } else {
        options = {
          audio: fs.readFileSync(convert),
          mimetype: typeAudio ? "audio/mp4" : mimeType,
          ptt: true
        };
      }
    } else if (typeMessage === "document") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body ? body: null,
        fileName: fileName,
        mimetype: mimeType
      };
    } else if (typeMessage === "application") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body ? body: null,
        fileName: fileName,
        mimetype: mimeType
      };
    } else {
      options = {
        image: fs.readFileSync(pathMedia),
        caption: body ? body: fileName,
      };
    }

    return options;
  } catch (e) {
    Sentry.captureException(e);
    console.log(e);
    return null;
  }
};

const SendWhatsAppMedia = async ({
  media,
  ticket,
  body,
  isPrivate,
  isForwarded = false
}: Request): Promise<WAMessage> => {
  try {
    const wbot = await getWbot(ticket.whatsappId);
    const companyId = ticket.companyId.toString();

    // Garante que o arquivo esteja disponível localmente.
    // Para arquivos novos (no Spaces), faz download para /tmp se necessário.
    // media.filename pode ser CDN URL (novo) ou só o nome (antigo).
    const cdnRef = isSpacesUrl(media.filename) ? media.filename : null;
    const resolvedPath = await ensureLocalFile(media.path, cdnRef || `company${companyId}/${media.filename}`);
    const isTemp = resolvedPath !== media.path; // baixou do Spaces para /tmp

    const typeMessage = media.mimetype.split("/")[0];
    let options: AnyMessageContent;
    let bodyTicket = "";
    const bodyMedia = formatBody(body, ticket);

    if (typeMessage === "video") {
      options = {
        video: fs.readFileSync(resolvedPath),
        caption: bodyMedia,
        fileName: media.originalname.replace("/", "-"),
        contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded }
      };
      bodyTicket = "🎥 Arquivo de vídeo";
    } else if (typeMessage === "audio") {
      const convert = await processAudio(resolvedPath, companyId);
      options = {
        audio: fs.readFileSync(convert),
        mimetype: "audio/mp4",
        ptt: true,
        caption: bodyMedia,
        contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded }
      };
      fs.existsSync(convert) && unlinkSync(convert);
      bodyTicket = "🎵 Arquivo de áudio";
    } else if (typeMessage === "document" || typeMessage === "text") {
      options = {
        document: fs.readFileSync(resolvedPath),
        caption: bodyMedia,
        fileName: media.originalname.replace("/", "-"),
        mimetype: media.mimetype,
        contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded }
      };
      bodyTicket = "📂 Documento";
    } else if (typeMessage === "application") {
      options = {
        document: fs.readFileSync(resolvedPath),
        caption: bodyMedia,
        fileName: media.originalname.replace("/", "-"),
        mimetype: media.mimetype,
        contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded }
      };
      bodyTicket = "📎 Outros anexos";
    } else {
      options = {
        image: fs.readFileSync(resolvedPath),
        caption: bodyMedia,
        contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded }
      };
      bodyTicket = "📎 Outros anexos";
    }

    // Limpa arquivos temporários (temp do upload ou download do Spaces)
    if (isTemp || (media.path && media.path.startsWith(os.tmpdir()))) {
      try { fs.existsSync(resolvedPath) && fs.unlinkSync(resolvedPath); } catch (_) {}
    }
    if (media.path && media.path !== resolvedPath && media.path.startsWith(os.tmpdir())) {
      try { fs.existsSync(media.path) && fs.unlinkSync(media.path); } catch (_) {}
    }
    // Limpa arquivo local da pasta public se já foi enviado para Spaces
    if (isSpacesUrl(media.filename) && media.path && !media.path.startsWith(os.tmpdir())) {
      try { fs.existsSync(media.path) && fs.unlinkSync(media.path); } catch (_) {}
    }

    if (isPrivate) {
      const backendUrl = process.env.BACKEND_URL || "";
      const mediaUrl = isSpacesUrl(media.filename)
        ? media.filename
        : `${backendUrl}/public/company${companyId}/${media.filename}`;
      const messageData = {
        wid: `PVT${companyId}${ticket.id}${body.substring(0, 6)}`,
        ticketId: ticket.id,
        contactId: undefined,
        body: bodyMedia,
        fromMe: true,
        mediaUrl,
        mediaType: media.mimetype.split("/")[0],
        read: true,
        quotedMsgId: null,
        ack: 2,
        remoteJid: null,
        participant: null,
        dataJson: null,
        ticketTrakingId: null,
        isPrivate
      };
      await CreateMessageService({ messageData, companyId: ticket.companyId });
      return;
    }

    const contactNumber = await Contact.findByPk(ticket.contactId);
    let number: string;
    if (contactNumber.remoteJid && contactNumber.remoteJid !== "" && contactNumber.remoteJid.includes("@")) {
      number = contactNumber.remoteJid;
    } else {
      number = `${contactNumber.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
    }

    const sentMessage = await wbot.sendMessage(number, { ...options });
    await ticket.update({ lastMessage: bodyTicket || media.originalname, imported: null });

    // Salva imediatamente no banco e emite socket para o frontend mostrar a mensagem
    if (sentMessage?.key?.id) {
      const mediaUrl = isSpacesUrl(media.filename)
        ? media.filename
        : `${process.env.BACKEND_URL || ""}/public/company${companyId}/${media.filename}`;
      const messageData = {
        wid: sentMessage.key.id,
        ticketId: ticket.id,
        contactId: undefined,
        body: bodyMedia || media.originalname,
        fromMe: true,
        mediaUrl,
        mediaType: media.mimetype.split("/")[0],
        read: true,
        quotedMsgId: null,
        ack: 1,
        remoteJid: sentMessage.key.remoteJid,
        participant: null,
        dataJson: JSON.stringify(sentMessage),
        ticketTrakingId: null,
        isPrivate: false,
        isForwarded
      };
      try {
        await CreateMessageService({ messageData, companyId: ticket.companyId });
      } catch (saveErr) {
        console.warn("[SendWhatsAppMedia] Falha ao salvar mensagem no banco:", saveErr?.message);
      }
    }

    return sentMessage;
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMedia;
