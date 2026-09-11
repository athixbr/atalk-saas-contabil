
import path, { join } from "path";
import { promisify } from "util";
import { readFile, writeFile } from "fs";
import fs from "fs";
import os from "os";
import * as Sentry from "@sentry/node";
import { isNil, isNull } from "lodash";
import ffmpeg from "fluent-ffmpeg";
import OpenAI from "openai";
import {
  SpeechConfig,
  SpeechSynthesizer,
  AudioConfig
} from "microsoft-cognitiveservices-speech-sdk";

import {
  downloadMediaMessage,
  extractMessageContent,
  getContentType,
  GroupMetadata,
  isLidUser,
  isPnUser,
  jidNormalizedUser,
  delay,
  MessageUpsertType,
  proto,
  WAMessage,
  WAMessageStubType,
  WAMessageUpdate,
  WASocket
} from "@whiskeysockets/baileys";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";

import { getIO } from "../../libs/socket";
import { resolveLidJid, storeLidMapping } from "../../libs/lidCache";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { logger } from "../../utils/logger";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import { debounce } from "../../helpers/Debounce";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import formatBody from "../../helpers/Mustache";
import TicketTraking from "../../models/TicketTraking";
import UserRating from "../../models/UserRating";
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import sendFaceMessage from "../FacebookServices/sendFacebookMessage";
import moment from "moment";
import Queue from "../../models/Queue";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";
import VerifyCurrentSchedule from "../CompanyService/VerifyCurrentSchedule";
import Campaign from "../../models/Campaign";
import CampaignShipping from "../../models/CampaignShipping";
// @ts-ignore
// @ts-ignore
// @ts-ignore
import { Op } from "sequelize";
import { campaignQueue, parseToMilliseconds, randomValue } from "../../queues";
import User from "../../models/User";
import { sayChatbot } from "./ChatBotListener";
import MarkDeleteWhatsAppMessage from "./MarkDeleteWhatsAppMessage";
import ListUserQueueServices from "../UserQueueServices/ListUserQueueServices";
import cacheLayer from "../../libs/cache";
import { addLogs } from "../../helpers/addLogs";
import SendWhatsAppMedia, { getMessageOptions } from "./SendWhatsAppMedia";

import ShowQueueIntegrationService from "../QueueIntegrationServices/ShowQueueIntegrationService";
import { createDialogflowSessionWithModel } from "../QueueIntegrationServices/CreateSessionDialogflow";
import { queryDialogFlow } from "../QueueIntegrationServices/QueryDialogflow";
import CompaniesSettings from "../../models/CompaniesSettings";
import CreateLogTicketService from "../TicketServices/CreateLogTicketService";
import Whatsapp from "../../models/Whatsapp";
import QueueIntegrations from "../../models/QueueIntegrations";
import ShowFileService from "../FileServices/ShowService";
import typebotListener from "../TypebotServices/typebotListener";
import { provider } from './providers';
import { uploadBufferToSpaces, buildSpacesKey } from "../../helpers/uploadToSpaces";
import UpdateTicketMetricsService from "../TicketMetricsServices/UpdateTicketMetricsService";
import UpdateTicketUserMetricsService from "../TicketMetricsServices/UpdateTicketUserMetricsService";

const request = require("request");

ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");


type Session = WASocket & {
  id?: number;
};

interface SessionOpenAi extends OpenAI {
  id?: number;
}
const sessionsOpenAi: SessionOpenAi[] = [];

interface ImessageUpsert {
  messages: proto.IWebMessageInfo[];
  type: MessageUpsertType;
}

interface IMe {
  name: string;
  id: string;
}

type IMineTypeMessage = proto.Message.IDocumentMessage | proto.Message.IImageMessage | proto.Message.IAudioMessage | proto.Message.IVideoMessage | proto.Message.IStickerMessage;
const writeFileAsync = promisify(writeFile);

function removeFile(directory) {
  fs.unlink(directory, (error) => {
    if (error) throw error;
  });
}

const getTimestampMessage = (msgTimestamp: any) => {
  return msgTimestamp * 1
}

const multVecardGet = function (param: any) {
  let output = " "

  let name = param.split("\n")[2].replace(";;;", "\n").replace('N:', "").replace(";", "").replace(";", " ").replace(";;", " ").replace("\n", "")
  let inicio = param.split("\n")[4].indexOf('=')
  let fim = param.split("\n")[4].indexOf(':')
  let contact = param.split("\n")[4].substring(inicio + 1, fim).replace(";", "")
  let contactSemWhats = param.split("\n")[4].replace("item1.TEL:", "")

  if (contact != "item1.TEL") {
    output = output + name + ": 📞" + contact + "" + "\n"
  } else
    output = output + name + ": 📞" + contactSemWhats + "" + "\n"
  return output
}

const contactsArrayMessageGet = (msg: any,) => {
  let contactsArray = msg.message?.contactsArrayMessage?.contacts
  let vcardMulti = contactsArray.map(function (item, indice) {
    return item.vcard;
  });

  let bodymessage = ``
  vcardMulti.forEach(function (vcard, indice) {
    bodymessage += vcard + "\n\n" + ""
  })

  let contacts = bodymessage.split("BEGIN:")

  contacts.shift()
  let finalContacts = ""
  for (let contact of contacts) {
    finalContacts = finalContacts + multVecardGet(contact)
  }

  return finalContacts
}

const getTypeMessage = (msg: proto.IWebMessageInfo): string => {
  const msgType = getContentType(msg.message);
  if (msg.message?.viewOnceMessageV2) {
    return "viewOnceMessageV2"
  }
  return msgType
};

// const getBodyButton = (msg: proto.IWebMessageInfo): string => {
//   if (msg.key.fromMe && msg?.message?.buttonsMessage?.contentText) {
//     let bodyMessage = `*${msg?.message?.buttonsMessage?.contentText}*`;
//     // eslint-disable-next-line no-restricted-syntax
//     for (const buton of msg.message?.buttonsMessage?.buttons) {
//       bodyMessage += `\n\n${buton.buttonText?.displayText}`;
//     }
//     return bodyMessage;
//   }

//   if (msg.key.fromMe && msg?.message?.listMessage) {
//     let bodyMessage = `*${msg?.message?.listMessage?.description}*`;
//     // eslint-disable-next-line no-restricted-syntax
//     for (const buton of msg.message?.listMessage?.sections) {
//       for (const rows of buton.rows) {
//         bodyMessage += `\n\n${rows.title}`;
//       }
//     }

//     return bodyMessage;
//   }
//   if (msg.key.fromMe && msg?.message?.viewOnceMessage?.message?.listMessage) {
//     let bodyMessage = `*${msg?.message?.viewOnceMessage?.message?.listMessage?.description}*`;
//     // eslint-disable-next-line no-restricted-syntax
//     for (const buton of msg?.message?.viewOnceMessage?.message?.listMessage
//       ?.sections) {
//       for (const rows of buton.rows) {
//         bodyMessage += `\n\n${rows.title}`;
//       }
//     }

//     return bodyMessage;
//   }
//   if (
//     msg.key.fromMe &&
//     msg?.message?.viewOnceMessage?.message?.buttonsMessage
//   ) {
//     let bodyMessage = `*${msg?.message?.viewOnceMessage?.message?.buttonsMessage?.contentText}*`;
//     // eslint-disable-next-line no-restricted-syntax
//     for (const buton of msg?.message?.viewOnceMessage?.message?.buttonsMessage
//       ?.buttons) {
//       bodyMessage += `\n\n${buton.buttonText?.displayText}`;
//     }

//     return bodyMessage;
//   }
// };

const getBodyButton = (msg: proto.IWebMessageInfo): string => {
  if (msg.key.fromMe && msg.message.buttonsMessage?.contentText) {
    let bodyMessage = `${msg?.message?.buttonsMessage?.contentText}`;

    for (const buton of msg.message?.buttonsMessage?.buttons) {
      bodyMessage += `\n\n${buton.buttonText?.displayText}`;
    }
    return bodyMessage;
  }

  if (msg.key.fromMe && msg?.message?.viewOnceMessage?.message?.listMessage) {
    let bodyMessage = `${msg?.message?.viewOnceMessage?.message?.listMessage?.description}`;
    for (const buton of msg.message?.viewOnceMessage?.message?.listMessage?.sections) {
      for (const rows of buton.rows) {
        bodyMessage += `\n\n${rows.title}`;
      }
    }

    return bodyMessage;
  }
};

const getBodyList = (msg: proto.IWebMessageInfo): string => {
  if (msg.key.fromMe && msg.message.listMessage?.description) {
    let bodyMessage = `${msg.message.listMessage?.description}`;
    for (const buton of msg.message.listMessage?.sections) {
      for (const rows of buton.rows) {
        bodyMessage += `\n\n${rows.title}`;
      }
    }
    return bodyMessage;
  }

  if (msg.key.fromMe && msg?.message?.viewOnceMessage?.message?.listMessage) {
    let bodyMessage = `${msg?.message?.viewOnceMessage?.message?.listMessage?.description}`;
    for (const buton of msg.message?.viewOnceMessage?.message?.listMessage?.sections) {
      for (const rows of buton.rows) {
        bodyMessage += `\n\n${rows.title}`;
      }
    }

    return bodyMessage;
  }
};

const msgLocation = (image, latitude, longitude) => {
  if (image) {
    var b64 = Buffer.from(image).toString("base64");

    let data = `data:image/png;base64, ${b64} | https://maps.google.com/maps?q=${latitude}%2C${longitude}&z=17&hl=pt-BR|${latitude}, ${longitude} `;
    return data;
  }
};

export const getBodyMessage = (msg: proto.IWebMessageInfo): string | null => {
  try {
    let type = getTypeMessage(msg);

    const types = {
      conversation: msg.message?.conversation,
      imageMessage: msg.message?.imageMessage?.caption,
      videoMessage: msg.message?.videoMessage?.caption,
      extendedTextMessage: msg?.message?.extendedTextMessage?.text,
      buttonsResponseMessage: msg.message?.buttonsResponseMessage?.selectedDisplayText,
      listResponseMessage: msg.message?.listResponseMessage?.title || msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId,
      templateButtonReplyMessage: msg.message?.templateButtonReplyMessage?.selectedId,
      messageContextInfo: msg.message?.buttonsResponseMessage?.selectedButtonId || msg.message?.listResponseMessage?.title,
      buttonsMessage: getBodyButton(msg) || msg.message?.listResponseMessage?.title,
      stickerMessage: "sticker",
      contactMessage: msg.message?.contactMessage?.vcard,
      contactsArrayMessage: (msg.message?.contactsArrayMessage?.contacts) && contactsArrayMessageGet(msg),
      //locationMessage: `Latitude: ${msg.message.locationMessage?.degreesLatitude} - Longitude: ${msg.message.locationMessage?.degreesLongitude}`,
      locationMessage: msgLocation(msg.message?.locationMessage?.jpegThumbnail, msg.message?.locationMessage?.degreesLatitude, msg.message?.locationMessage?.degreesLongitude),
      liveLocationMessage: `Latitude: ${msg.message?.liveLocationMessage?.degreesLatitude} - Longitude: ${msg.message?.liveLocationMessage?.degreesLongitude}`,
      documentMessage: msg.message?.documentMessage?.caption,
      audioMessage: "Áudio",
      listMessage: getBodyList(msg) || msg.message?.listResponseMessage?.title,
      viewOnceMessage: getBodyButton(msg),
      reactionMessage: msg.message?.reactionMessage?.text || "reaction",
      senderKeyDistributionMessage: msg?.message?.senderKeyDistributionMessage?.axolotlSenderKeyDistributionMessage,
      documentWithCaptionMessage: msg.message?.documentWithCaptionMessage?.message?.documentMessage?.caption,
      viewOnceMessageV2: msg.message?.viewOnceMessageV2?.message?.imageMessage?.caption,
      editedMessage: msg?.message?.protocolMessage?.editedMessage?.conversation || msg.message?.editedMessage?.message?.protocolMessage?.editedMessage?.conversation || msg.message?.editedMessage?.message?.extendedTextMessage?.text,
      protocolMessage: msg.message?.protocolMessage?.type || msg.message?.ephemeralMessage?.message?.protocolMessage?.type || msg?.message?.protocolMessage?.editedMessage?.conversation,
      // editedMessage: msg.message?.editedMessage?.message?.extendedTextMessage?.text,
      ephemeralMessage: msg.message?.ephemeralMessage?.message?.extendedTextMessage?.text,
      pollCreationMessage: msg.message?.pollCreationMessage?.name
        ? `📊 Enquete: ${msg.message.pollCreationMessage.name}\n${(msg.message.pollCreationMessage.options || []).map((o: any, i: number) => `${i + 1}. ${o.optionName}`).join("\n")}`
        : "📊 Enquete",
      pollUpdateMessage: "📊 Voto em enquete",
      interactiveMessage: msg.message?.interactiveMessage?.body?.text
        || (msg.message?.interactiveMessage?.header as any)?.title
        || "Mensagem interativa",
      interactiveResponseMessage: msg.message?.interactiveResponseMessage?.body?.text
        || (msg.message?.interactiveResponseMessage as any)?.nativeFlowResponseMessage?.paramsJson
        || "Resposta interativa",
      nativeFlowResponseMessage: (msg.message as any)?.nativeFlowResponseMessage?.paramsJson || "Resposta de fluxo",
      orderMessage: `🛒 Pedido #${msg.message?.orderMessage?.orderId || ""}`,
      productMessage: msg.message?.productMessage?.product?.title
        ? `🏷️ Produto: ${msg.message.productMessage.product.title}`
        : "🏷️ Produto",
      templateMessage: msg.message?.templateMessage?.hydratedTemplate?.hydratedContentText
        || msg.message?.templateMessage?.hydratedFourRowTemplate?.hydratedContentText
        || "Mensagem template",
      albumMessage: "📷 Álbum",
      eventMessage: msg.message?.eventMessage?.name
        ? `📅 Evento: ${msg.message.eventMessage.name}`
        : "📅 Evento",
      keepInChatMessage: "📌 Mensagem fixada",
      pinInChatMessage: "📌 Mensagem fixada",
      groupInviteMessage: msg.message?.groupInviteMessage?.caption
        || `👥 Convite para grupo: ${msg.message?.groupInviteMessage?.groupName || ""}`
    };

    const objKey = Object.keys(types).find(key => key === type);

    if (!objKey) {
      logger.warn(`#### Nao achou o type 152: ${type}
${JSON.stringify(msg)}`);
      Sentry.setExtra("Mensagem", { BodyMsg: msg.message, msg, type });
      Sentry.captureException(
        new Error("Novo Tipo de Mensagem em getTypeMessage")
      );
    }
    return types[type];
  } catch (error) {
    Sentry.setExtra("Error getTypeMessage", { msg, BodyMsg: msg.message });
    Sentry.captureException(error);
    console.log(error);
  }
};

const resolveMentions = async (
  msg: proto.IWebMessageInfo,
  body: string | null,
  companyId: number
): Promise<string | null> => {
  if (!body) return body;

  const msgContent = msg.message;
  const contextInfo =
    msgContent?.extendedTextMessage?.contextInfo ||
    msgContent?.imageMessage?.contextInfo ||
    msgContent?.videoMessage?.contextInfo ||
    msgContent?.documentMessage?.contextInfo ||
    msgContent?.audioMessage?.contextInfo;

  const mentionedJids: string[] = (contextInfo?.mentionedJid as string[]) || [];
  if (mentionedJids.length === 0) return body;

  let resolvedBody = body;

  for (const jid of mentionedJids) {
    const number = jid.split("@")[0];
    if (!number) continue;

    const contact = await Contact.findOne({ where: { number, companyId } });
    if (contact?.name) {
      resolvedBody = resolvedBody.replace(new RegExp(`@${number}`, "g"), `@${contact.name}`);
    }
  }

  return resolvedBody;
};

export const getQuotedMessage = (msg: proto.IWebMessageInfo) => {
  const body = extractMessageContent(msg.message)[
    Object.keys(msg?.message).values().next().value
  ];

  if (!body?.contextInfo?.quotedMessage) return;
  const quoted = extractMessageContent(
    body?.contextInfo?.quotedMessage[
    Object.keys(body?.contextInfo?.quotedMessage).values().next().value
    ]
  );

  return quoted;
};

export const getQuotedMessageId = (msg: proto.IWebMessageInfo) => {
  const body = extractMessageContent(msg.message)[
    Object.keys(msg?.message).values().next().value
  ];
  let reaction = msg?.message?.reactionMessage
    ? msg?.message?.reactionMessage?.key?.id
    : "";

  return reaction ? reaction : body?.contextInfo?.stanzaId;
};

const getMeSocket = (wbot: Session): IMe => {
  return {
    id: jidNormalizedUser((wbot as WASocket).user.id),
    name: (wbot as WASocket).user.name
  }
};

const getSenderMessage = (
  msg: proto.IWebMessageInfo,
  wbot: Session
): string => {
  const me = getMeSocket(wbot);
  if (msg.key.fromMe) return me.id;

  const senderId =
    msg.participant || msg.key.participant || msg.key.remoteJid || undefined;

  return senderId && jidNormalizedUser(senderId);
};

/**
 * Resolve JID em formato @lid para o número real @s.whatsapp.net
 * Prioridade: 1) Map em memória (imediato), 2) Redis (persistênte)
 */
const resolveJidToPhone = async (jid: string): Promise<string> => {
  if (!jid || !isLidUser(jid)) return jid;
  const resolved = await resolveLidJid(jid);
  return resolved || jid; // fallback: usa o LID (merge acontece via contacts.upsert)
};

const getContactMessage = async (msg: proto.IWebMessageInfo, wbot: Session) => {
  const isGroup = msg.key.remoteJid.includes("g.us");

  // Baileys v7: remoteJidAlt (DMs) e participantAlt (grupos) contêm o JID alternativo
  // (PN quando primary é LID, ou LID quando primary é PN).
  // Esta é a fonte mais confiável — disponível em cada mensagem, sem depender de
  // lid-mapping.update (que raramente dispara, conforme issue #2263 do Baileys).
  const msgKey = msg.key as any;
  const altJid: string | undefined = isGroup ? msgKey.participantAlt : msgKey.remoteJidAlt;
  const primaryJid: string | undefined = isGroup
    ? (msg.key.participant || msg.key.remoteJid)
    : msg.key.remoteJid;

  if (altJid && primaryJid) {
    const lidJid = isLidUser(primaryJid) ? primaryJid : isLidUser(altJid) ? altJid : null;
    const pnJid  = isPnUser(primaryJid)  ? primaryJid : isPnUser(altJid)  ? altJid  : null;
    if (lidJid && pnJid) {
      await storeLidMapping(lidJid, pnJid);
    }
  }

  if (isGroup) {
    // Para mensagens de grupo, o remetente pode ser @lid no Baileys v7
    let senderId = getSenderMessage(msg, wbot);
    senderId = await resolveJidToPhone(senderId);
    return { id: senderId, name: msg.pushName };
  } else {
    // Para mensagens diretas, passa o JID original (pode ser @lid) para verifyContact.
    // NÃO resolver aqui — verifyContact tem a lógica de atualizar o placeholder LID antes
    // de buscar/criar o contato, evitando a duplicação de contato (e ticket).
    // Se resolver aqui, verifyContact recebe um JID já resolvido (@s.whatsapp.net),
    // isLidUser() retorna false, o bloco LID é pulado e o placeholder fica
    // com número errado — fazendo CreateOrUpdateContactService criar um contato duplicado.
    const rawNumber = msg.key.remoteJid.replace(/\D/g, "");
    return {
      id: msg.key.remoteJid,
      name: msg.key.fromMe ? rawNumber : msg.pushName
    };
  }
};

const getMineType = (msg: proto.IWebMessageInfo): IMineTypeMessage => {
  const mineType =
    msg.message?.imageMessage ||
    msg.message?.audioMessage ||
    msg.message?.videoMessage ||
    msg.message?.stickerMessage ||
    msg.message?.documentMessage ||
    msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
  return mineType;
}

const getMediaName = (msg: proto.IWebMessageInfo): string => {
  return msg.message?.documentMessage?.fileName ||
    msg.message?.documentWithCaptionMessage?.message?.documentMessage.fileName || "";
}

const downloadMedia = async (msg: proto.IWebMessageInfo, isImported: Date = null) => {

  let buffer
  try {
    buffer = await downloadMediaMessage(
      msg as any,
      'buffer',
      {}
    )
  } catch (err) {

    if (isImported) {
      console.log("Falha ao fazer o download de uma mensagem importada, provavelmente a mensagem já não esta mais disponível")
    } else {
      console.error('Erro ao baixar mídia:', err);
    }

    return null;
  }

  if (!buffer) {
    console.error('Buffer de mídia vazio após download');
    return null;
  }

  let filename = getMediaName(msg);

  const mineType = getMineType(msg);

  if (!mineType)
    console.log(msg)

  if (!filename) {
    const ext = mineType.mimetype.split("/")[1].split(";")[0];
    filename = `${new Date().getTime()}.${ext}`;
  } else {
    filename = `${new Date().getTime()}_${filename}`;
  }

  const media = {
    data: buffer,
    mimetype: mineType.mimetype,
    filename
  };

  return media;
}

const verifyContact = async (
  msgContact: IMe,
  wbot: Session,
  companyId: number
): Promise<Contact> => {

  const isGroup = msgContact.id.includes("g.us");
  const isLid = isLidUser(msgContact.id);

  // --- Tratamento especial para contatos @lid (Baileys v7 privacy) ---
  if (isLid) {
    // 1. Tentar resolver do cache (memória → Redis)
    const originalLid = msgContact.id;
    const resolvedJid = await resolveLidJid(msgContact.id);
    if (resolvedJid) {
      // Cache resolveu: trocar o JID pelo número real e processar normalmente
      msgContact = { ...msgContact, id: resolvedJid };
      logger.info(`[LID] verifyContact: ${originalLid} resolvido via cache → ${resolvedJid}`);

      // Sincroniza o placeholder no banco antes de chamar CreateOrUpdateContact.
      // Sem isso, CreateOrUpdateContact não acha o placeholder pelo número real (ainda
      // tem os dígitos do LID) nem pelo remoteJid (ainda tem @lid) e cria um contato
      // duplicado — que só seria fundido depois pelo applyLidMapping.
      const phoneNumber = resolvedJid.replace(/\D/g, "");
      const lidPlaceholder = await Contact.findOne({
        where: { remoteJid: originalLid, companyId }
      });
      if (lidPlaceholder && (lidPlaceholder.number !== phoneNumber || lidPlaceholder.remoteJid !== resolvedJid)) {
        // Verifica se outro contato já tem esse número para evitar UniqueConstraintError
        const conflictContact = await Contact.findOne({ where: { number: phoneNumber, companyId } });
        if (!conflictContact || conflictContact.id === lidPlaceholder.id) {
          await lidPlaceholder.update({ number: phoneNumber, remoteJid: resolvedJid });
          logger.info(`[LID] verifyContact: placeholder id=${lidPlaceholder.id} atualizado ${originalLid} → ${resolvedJid}`);
        } else {
          logger.info(`[LID] verifyContact: número ${phoneNumber} já pertence ao contato ${conflictContact.id}, reutilizando`);
          msgContact = { ...msgContact, id: resolvedJid };
        }
      }
    } else {
      // 2. Fallback: signalRepository.lidMapping interno do Baileys (persiste entre restarts via auth)
      try {
        const phoneJidFromRepo = await (wbot as any).signalRepository?.lidMapping?.getPNForLID(msgContact.id);
        if (phoneJidFromRepo && isPnUser(phoneJidFromRepo)) {
          await storeLidMapping(msgContact.id, phoneJidFromRepo);
          msgContact = { ...msgContact, id: phoneJidFromRepo };
          logger.info(`[LID] verifyContact: ${originalLid} resolvido via signalRepository → ${phoneJidFromRepo}`);

          const phoneNumber = phoneJidFromRepo.replace(/\D/g, "");
          const lidPlaceholder = await Contact.findOne({ where: { remoteJid: originalLid, companyId } });
          if (lidPlaceholder && (lidPlaceholder.number !== phoneNumber || lidPlaceholder.remoteJid !== phoneJidFromRepo)) {
            const conflictContact2 = await Contact.findOne({ where: { number: phoneNumber, companyId } });
            if (!conflictContact2 || conflictContact2.id === lidPlaceholder.id) {
              await lidPlaceholder.update({ number: phoneNumber, remoteJid: phoneJidFromRepo });
            }
          }
          // Segue o fluxo normal com o JID real
        }
      } catch (_) { /* signalRepository pode não estar disponível — ignora */ }

      if (isLidUser(msgContact.id)) {
        // 3. Cache ainda vazio: buscar no banco pelo remoteJid=lidJid (contato já visto antes)
        const existingByLid = await Contact.findOne({
          where: { remoteJid: msgContact.id, companyId }
        });
        if (existingByLid) {
          // Já existe placeholder para esse LID — retorna sem criar duplicata
          return existingByLid;
        }

        // 4. Tentar achar contato real pelo pushName para evitar duplicata
        //    Só usa se o nome for único nesta empresa (não ambíguo)
        if (msgContact.name) {
          const byName = await Contact.findAll({
            where: { name: msgContact.name, companyId },
            order: [["updatedAt", "DESC"]],
            limit: 2
          });
          if (byName.length === 1) {
            const realContact = byName[0];
            await realContact.update({ remoteJid: msgContact.id });
            await storeLidMapping(msgContact.id, `${realContact.number}@s.whatsapp.net`);
            logger.info(`[LID] verifyContact: ${msgContact.id} associado ao contato ${realContact.id} via pushName "${msgContact.name}"`);
            return realContact;
          }
        }

        // 5. Nenhuma correspondência — criar placeholder (será resolvido na próxima mensagem)
        logger.info(`[LID] verifyContact: ${msgContact.id} sem resolução, criando placeholder`);
      }
    }
  }
  // --- fim tratamento LID ---

  const isLidFinal = isLidUser(msgContact.id); // pode ter mudado após resolução

  // Para @lid não resolvido: não tenta buscar foto (WhatsApp rejeita @lid)
  let profilePicUrl: string;
  if (isLidFinal) {
    profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
  } else {
    const picCacheKey = `profilePic:${msgContact.id}`;
    const cachedPic = await cacheLayer.get(picCacheKey);
    if (cachedPic) {
      profilePicUrl = cachedPic;
    } else {
      try {
        const picPromise = wbot.profilePictureUrl(msgContact.id, "image");
        const picTimeout = new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error("profilePicUrl timeout")), 5000)
        );
        profilePicUrl = await Promise.race([picPromise, picTimeout]);
      } catch (e) {
        profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
      }
      await cacheLayer.set(picCacheKey, profilePicUrl, "EX", 3600);
    }
  }

  let number: string;
  if (isGroup) {
    number = msgContact.id.replace("@g.us", "");
  } else if (isLidFinal) {
    number = msgContact.id.replace(/\D/g, "");
  } else {
    number = msgContact.id.replace(/\D/g, "");
  }

  const contactData = {
    name: msgContact.name || number,
    number,
    profilePicUrl,
    isGroup,
    companyId,
    remoteJid: msgContact.id
  };

  const contact = await CreateOrUpdateContactService(contactData);

  return contact;
};

const verifyQuotedMessage = async (
  msg: proto.IWebMessageInfo
): Promise<Message | null> => {
  if (!msg) return null;
  const quoted = getQuotedMessageId(msg);

  if (!quoted) return null;

  const quotedMsg = await Message.findOne({
    where: { wid: quoted }
  });

  if (!quotedMsg) return null;

  return quotedMsg;
};

export const verifyMediaMessage = async (
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact,
  ticketTraking?: TicketTraking,
  isForwarded?: boolean
): Promise<Message> => {
  const io = getIO();
  const quotedMsg = await verifyQuotedMessage(msg);
  const companyId = ticket.companyId;

  try {
    const media = await downloadMedia(msg, ticket?.imported);
    if (!media && ticket.imported) {
      const body =
        "*System:* \nFalha no download da mídia verifique no dispositivo";
      const messageData = {
        //mensagem de texto
        wid: msg.key.id,
        ticketId: ticket.id,
        contactId: msg.key.fromMe ? undefined : ticket.contactId,
        body,
        reactionMessage: msg.message?.reactionMessage,
        fromMe: msg.key.fromMe,
        mediaType: getTypeMessage(msg),
        read: msg.key.fromMe,
        quotedMsgId: quotedMsg?.id || msg.message?.reactionMessage?.key?.id,
        ack: msg.status,
        companyId: companyId,
        remoteJid: msg.key.remoteJid,
        participant: msg.key.participant,
        timestamp: getTimestampMessage(msg.messageTimestamp),
        createdAt: new Date(
          Math.floor(getTimestampMessage(msg.messageTimestamp) * 1000)
        ).toISOString(),
        dataJson: JSON.stringify(msg),
        ticketImported: ticket.imported,
        isForwarded
      };

      await ticket.update({
        lastMessage: body
      });
      logger.error(Error("ERR_WAPP_DOWNLOAD_MEDIA"));
      return CreateMessageService({ messageData, companyId: companyId });
    }

    if (!media) {
      throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
    }

    if (!media.data) {
      logger.warn(`ERR_WAPP_DOWNLOAD_MEDIA: buffer vazio para ${media.filename}`);
      throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
    }


    //   const ext = media.mimetype === "audio/mp4" ? "m4a" : media.mimetype.split("/")[1].split(";")[0];
    //   media.filename = `${new Date().getTime()}.${ext}`;
    // } else {
    //   // ext = tudo depois do ultimo .
    //   const ext = media.filename.split(".").pop();
    //   // name = tudo antes do ultimo .
    //   const name = media.filename.split(".").slice(0, -1).join(".").replace(/\s/g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    //   media.filename = `${name.trim()}_${new Date().getTime()}.${ext}`;
    // }
    if (!media.filename) {
      const ext = media.mimetype.split("/")[1].split(";")[0];
      media.filename = `${new Date().getTime()}.${ext}`;
    } else {
      // ext = tudo depois do ultimo .
      const ext = media.filename.split(".").pop();
      // name = tudo antes do ultimo .
      const name = media.filename.split(".").slice(0, -1).join(".").replace(/\s/g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      media.filename = `${name.trim()}_${new Date().getTime()}.${ext}`;
    }


    const backendUrl = process.env.BACKEND_URL || "";
    let mediaStoredUrl = `${backendUrl}/public/company${companyId}/${media.filename}`;

    try {
      const buffer: Buffer = Buffer.isBuffer(media.data)
        ? (media.data as Buffer)
        : Buffer.from(media.data.toString("base64"), "base64");

      // Upload para DigitalOcean Spaces
      try {
        const spacesKey = buildSpacesKey(companyId, media.filename);
        const cdnUrl = await uploadBufferToSpaces(buffer, spacesKey, media.mimetype);
        mediaStoredUrl = cdnUrl;
      } catch (spacesErr) {
        // Fallback: salva localmente se Spaces falhar
        logger.warn(`[Spaces] Falha no upload, salvando localmente: ${spacesErr.message}`);
        const localPublic = path.resolve(__dirname, "..", "..", "..", "..", "public");
        const companyDir = path.join(localPublic, `company${companyId}`);
        fs.mkdirSync(companyDir, { recursive: true });
        fs.writeFileSync(path.join(companyDir, media.filename), buffer as unknown as Uint8Array);
        mediaStoredUrl = `${backendUrl}/public/company${companyId}/${media.filename}`;
      }

      // Conversão de áudio ogg/mpeg → mp3 via temp file (não bloqueante)
      const isAudio = media.filename.endsWith(".ogg") || media.filename.endsWith(".mpeg");
      if (isAudio) {
        const tempIn = path.join(os.tmpdir(), `atalk-audio-${Date.now()}-${media.filename}`);
        const mp3Filename = media.filename.replace(/\.(ogg|mpeg)$/, ".mp3");
        const tempOut = path.join(os.tmpdir(), `atalk-audio-${Date.now()}-${mp3Filename}`);
        fs.writeFileSync(tempIn, buffer as unknown as Uint8Array);
        new Promise<void>((resolve, reject) => {
          ffmpeg(tempIn)
            .toFormat("mp3")
            .save(tempOut)
            .on("end", async () => {
              try {
                const mp3Buffer = fs.readFileSync(tempOut);
                const mp3Key = buildSpacesKey(companyId, mp3Filename);
                await uploadBufferToSpaces(mp3Buffer, mp3Key, "audio/mpeg");
              } catch (_) {}
              fs.existsSync(tempIn) && fs.unlinkSync(tempIn);
              fs.existsSync(tempOut) && fs.unlinkSync(tempOut);
              resolve();
            })
            .on("error", (err: any) => {
              fs.existsSync(tempIn) && fs.unlinkSync(tempIn);
              reject(err);
            });
        }).catch((err: any) => logger.warn(`Conversão mp3 falhou: ${err.message}`));
      }
    } catch (err) {
      Sentry.setExtra("Erro media salvar local", { companyId, ticket, contact, media, quotedMsg });
      Sentry.captureException(err);
      logger.error(err);
      console.log(msg);
    }

    const body = await resolveMentions(msg, getBodyMessage(msg), companyId);

    const messageData = {
      wid: msg.key.id,
      ticketId: ticket.id,
      contactId: msg.key.fromMe ? undefined : contact.id,
      body: body || media.filename,
      fromMe: msg.key.fromMe,
      read: msg.key.fromMe,
      mediaUrl: mediaStoredUrl,
      mediaType: media.mimetype.split("/")[0],
      quotedMsgId: quotedMsg?.id,
      ack: msg.status,
      remoteJid: msg.key.remoteJid,
      participant: msg.key.participant,
      dataJson: JSON.stringify(msg),
      ticketTrakingId: ticketTraking?.id,
      createdAt: new Date(
        Math.floor(getTimestampMessage(msg.messageTimestamp) * 1000)
      ).toISOString(),
      ticketImported: ticket.imported,
      isForwarded
    };

    await ticket.update({
      lastMessage: body || media.filename
    });

    if (!!ticketTraking) {
      await ticketTraking.update({
        lastMessage: body || media.filename,
      });
    }

    const newMessage = await CreateMessageService({
      messageData,
      companyId: companyId
    });

    if (!msg.key.fromMe && ticket.status === "closed") {
      await ticket.update({ status: "pending" });
      await ticket.reload({
        include: [
          { model: Queue, as: "queue" },
          { model: User, as: "user" },
          { model: Contact, as: "contact" },
          { model: Whatsapp, as: "whatsapp" }
        ]
      });

      io.to("closed").emit(`company-${companyId}-ticket`, {
        action: "delete",
        ticket,
        ticketId: ticket.id
      });

      io.to(ticket.status)
        .to(ticket.id.toString())
        .emit(`company-${companyId}-ticket`, {
          action: "update",
          ticket,
          ticketId: ticket.id
        });
    }

    return newMessage;
  } catch (error) {
    console.log(error);
    logger.warn("Erro ao baixar media");
  }
};

export const verifyMessage = async (
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact,
  ticketTraking?: TicketTraking,
  isPrivate?: boolean,
  isForwarded?: boolean
) => {
  const io = getIO();
  const quotedMsg = await verifyQuotedMessage(msg);
  const companyId = ticket.companyId;
  const body = await resolveMentions(msg, getBodyMessage(msg), companyId);

  const messageData = {
    wid: msg.key.id,
    ticketId: ticket.id,
    contactId: msg.key.fromMe ? undefined : contact.id,
    body,
    fromMe: msg.key.fromMe,
    mediaType: getTypeMessage(msg),
    read: msg.key.fromMe,
    quotedMsgId: quotedMsg?.id,
    ack: msg.status,
    remoteJid: msg.key.remoteJid,
    participant: msg.key.participant,
    dataJson: JSON.stringify(msg),
    ticketTrakingId: ticketTraking?.id,
    isPrivate: false,
    createdAt: new Date(
      Math.floor(getTimestampMessage(msg.messageTimestamp) * 1000)
    ).toISOString(),
    ticketImported: ticket.imported,
    isForwarded
  };

  await ticket.update({
    lastMessage: body
  });

  if (!!ticketTraking) {
    await ticketTraking.update({
      lastMessage: body,
    });
  }

  await CreateMessageService({ messageData, companyId: companyId });

  // Atualiza métricas de tempo real (ignora erros para não quebrar o fluxo)
  if (msg.key.fromMe) {
    UpdateTicketMetricsService({ ticketId: ticket.id, type: "user_message", userId: ticket.userId }).catch(() => {});
    if (ticket.userId) {
      UpdateTicketUserMetricsService({ ticketId: ticket.id, userId: ticket.userId, action: "message" }).catch(() => {});
    }
  } else {
    UpdateTicketMetricsService({ ticketId: ticket.id, type: "client_message" }).catch(() => {});
  }

  if (!msg.key.fromMe && ticket.status === "closed") {
    await ticket.update({ status: "pending" });
    await ticket.reload({
      include: [
        { model: Queue, as: "queue" },
        { model: User, as: "user" },
        { model: Contact, as: "contact" },
        { model: Whatsapp, as: "whatsapp" }
      ]
    });

    // io.to("closed").emit(`company-${companyId}-ticket`, {
    //   action: "delete",
    //   ticket,
    //   ticketId: ticket.id
    // });

    if (!ticket.imported) {
      io.to(ticket.status)
        .to(ticket.id.toString())
        .emit(`company-${companyId}-ticket`, {
          action: "update",
          ticket,
          ticketId: ticket.id
        });

    }

  }
};

const isValidMsg = (msg: proto.IWebMessageInfo): boolean => {
  if (msg.key.remoteJid === "status@broadcast") return false;
  try {
    const msgType = getTypeMessage(msg);
    if (!msgType) {
      return;
    }

    const ifType =
      msgType === "conversation" ||
      msgType === "extendedTextMessage" ||
      msgType === "audioMessage" ||
      msgType === "videoMessage" ||
      msgType === "imageMessage" ||
      msgType === "documentMessage" ||
      msgType === "stickerMessage" ||
      msgType === "buttonsResponseMessage" ||
      msgType === "buttonsMessage" ||
      msgType === "messageContextInfo" ||
      msgType === "locationMessage" ||
      msgType === "liveLocationMessage" ||
      msgType === "contactMessage" ||
      msgType === "voiceMessage" ||
      msgType === "mediaMessage" ||
      msgType === "contactsArrayMessage" ||
      msgType === "reactionMessage" ||
      msgType === "ephemeralMessage" ||
      msgType === "protocolMessage" ||
      msgType === "listResponseMessage" ||
      msgType === "listMessage" ||
      msgType === "viewOnceMessage" ||
      msgType === "documentWithCaptionMessage" ||
      msgType === "viewOnceMessageV2" ||
      msgType === "editedMessage" ||
      msgType === "pollCreationMessage" ||
      msgType === "pollUpdateMessage" ||
      msgType === "interactiveMessage" ||
      msgType === "interactiveResponseMessage" ||
      msgType === "nativeFlowResponseMessage" ||
      msgType === "orderMessage" ||
      msgType === "productMessage" ||
      msgType === "templateMessage" ||
      msgType === "albumMessage" ||
      msgType === "eventMessage" ||
      msgType === "keepInChatMessage" ||
      msgType === "pinInChatMessage" ||
      msgType === "groupInviteMessage";

    if (!ifType) {
      logger.warn(`#### Nao achou o type em isValidMsg: ${msgType}
${JSON.stringify(msg?.message)}`);
      Sentry.setExtra("Mensagem", { BodyMsg: msg.message, msg, msgType });
      Sentry.captureException(new Error("Novo Tipo de Mensagem em isValidMsg"));
    }

    return !!ifType;
  } catch (error) {
    Sentry.setExtra("Error isValidMsg", { msg });
    Sentry.captureException(error);



  }
};

const sendDialogflowAwswer = async (
  wbot: Session,
  ticket: Ticket,
  msg: WAMessage,
  contact: Contact,
  inputAudio: string | undefined,
  companyId: number,
  queueIntegration: QueueIntegrations
) => {

  const session = await createDialogflowSessionWithModel(
    queueIntegration
  );

  if (session === undefined) {
    return;
  }

  wbot.presenceSubscribe(contact.remoteJid);
  await delay(500)

  let dialogFlowReply = await queryDialogFlow(
    session,
    queueIntegration.projectName,
    contact.remoteJid,
    getBodyMessage(msg),
    queueIntegration.language,
    inputAudio
  );

  if (!dialogFlowReply) {
    wbot.sendPresenceUpdate("composing", contact.remoteJid);

    const bodyDuvida = formatBody(`\u200e *${queueIntegration?.name}:* Não consegui entender sua dúvida.`)


    await delay(1000);

    await wbot.sendPresenceUpdate('paused', contact.remoteJid)

    const sentMessage = await wbot.sendMessage(
      `${contact.number}@c.us`, {
      text: bodyDuvida
    }
    );

    await verifyMessage(sentMessage, ticket, contact);
    return;
  }

  if (dialogFlowReply.endConversation) {
    await ticket.update({
      contactId: ticket.contact.id.toString(),
      useIntegration: false
    });
  }

  const image = dialogFlowReply.parameters.image?.stringValue ?? undefined;

  const react = dialogFlowReply.parameters.react?.stringValue ?? undefined;

  const audio = dialogFlowReply.encodedAudio.toString("base64") ?? undefined;

  wbot.sendPresenceUpdate("composing", contact.remoteJid);
  await delay(500);

  let lastMessage;

  for (let message of dialogFlowReply.responses) {
    lastMessage = message.text.text[0] ? message.text.text[0] : lastMessage;
  }
  for (let message of dialogFlowReply.responses) {
    if (message.text) {
      await sendDelayedMessages(
        wbot,
        ticket,
        contact,
        message.text.text[0],
        lastMessage,
        audio,
        queueIntegration
      );
    }
  }
};

async function sendDelayedMessages(
  wbot: Session,
  ticket: Ticket,
  contact: Contact,
  message: string,
  lastMessage: string,
  audio: string | undefined,
  queueIntegration: QueueIntegrations
) {
  const companyId = ticket.companyId;

  const whatsapp = await ShowWhatsAppService(wbot.id!, companyId);
  const farewellMessage = whatsapp.farewellMessage.replace(/[_*]/g, "");

  // if (react) {
  //   const test =
  //     /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g.test(
  //       react
  //     );
  //   if (test) {
  //     msg.react(react);
  //     await delay(1000);
  //   }
  // }
  const sentMessage = await wbot.sendMessage(
    `${contact.number}@c.us`, {
    text: `\u200e *${queueIntegration?.name}:* ` + message
  }
  );


  await verifyMessage(sentMessage, ticket, contact);
  if (message != lastMessage) {
    await delay(500);
    wbot.sendPresenceUpdate("composing", contact.remoteJid);
  } else if (audio) {
    wbot.sendPresenceUpdate("recording", contact.remoteJid);
    await delay(500);


    // if (audio && message === lastMessage) {
    //   const newMedia = new MessageMedia("audio/ogg", audio);

    //   const sentMessage = await wbot.sendMessage(
    //     `${contact.number}@c.us`,
    //     newMedia,
    //     {
    //       sendAudioAsVoice: true
    //     }
    //   );

    //   await verifyMessage(sentMessage, ticket, contact);
    // }

    // if (sendImage && message === lastMessage) {
    //   const newMedia = await MessageMedia.fromUrl(sendImage, {
    //     unsafeMime: true
    //   });
    //   const sentMessage = await wbot.sendMessage(
    //     `${contact.number}@c.us`,
    //     newMedia,
    //     {
    //       sendAudioAsVoice: true
    //     }
    //   );

    //   await verifyMessage(sentMessage, ticket, contact);
    //   await ticket.update({ lastMessage: "📷 Foto" });
    // }

    if (farewellMessage && message.includes(farewellMessage)) {
      await delay(10000);
      setTimeout(async () => {
        await ticket.update({
          contactId: ticket.contact.id.toString(),
          useIntegration: true
        });
        await UpdateTicketService({
          ticketId: ticket.id,
          ticketData: { status: "closed" },
          companyId: companyId
        });
      }, 3000);
    }
  }
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function sleep(time) {
  await timeout(time);
}

const verifyQueue = async (
  wbot: Session,
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact,
  mediaSent?: Message | undefined,
  settings?: any
) => {
  const companyId = ticket.companyId;

  const { queues, greetingMessage, maxUseBotQueues, timeUseBotQueues } = await ShowWhatsAppService(wbot.id!, companyId);


  const ticketTraking = await FindOrCreateATicketTrakingService({
    ticketId: ticket.id,
    companyId: companyId,
    whatsappId: ticket.whatsapp?.id
  });

  let chatbot = false;

  if (queues.length === 1) {

    chatbot = queues[0]?.chatbots.length > 1;
  }

  const enableQueuePosition = settings.sendQueuePosition === "enabled";

  if (queues.length === 1 && !chatbot) {
    const sendGreetingMessageOneQueues = settings.sendGreetingMessageOneQueues === "enabled" || false;

    //inicia integração dialogflow/n8n
    if (!msg.key.fromMe && !ticket.isGroup && queues[0].integrationId) {

      const integrations = await ShowQueueIntegrationService(queues[0].integrationId, companyId);

      await handleMessageIntegration(msg, wbot, companyId, integrations, ticket)

      await ticket.update({
        useIntegration: true,
        integrationId: integrations.id
      })
    }

    //inicia integração openai
    if (!msg.key.fromMe && !ticket.isGroup && !isNil(queues[0]?.promptId)) {

      await handleOpenAi(msg, wbot, ticket, contact, mediaSent, ticketTraking);

      await ticket.update({
        useIntegration: true,
        promptId: queues[0]?.promptId
      })
      // return;
    }

    if (greetingMessage.length > 1 && sendGreetingMessageOneQueues) {

      const body = formatBody(`${greetingMessage}`, ticket);

      if (ticket.whatsapp.greetingMediaAttachment !== null) {
        const filePath = path.resolve("public", `company${companyId}`, ticket.whatsapp.greetingMediaAttachment);

        const messagePath = ticket.whatsapp.greetingMediaAttachment
        const optionsMsg = await getMessageOptions(messagePath, filePath, String(companyId), body);

        const sentMessage = await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, { ...optionsMsg });

        await verifyMediaMessage(sentMessage, ticket, contact, ticketTraking);
      } else {
        await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: body
          }
        );
      }
    }

    if (!isNil(queues[0].fileListId)) {
      try {
        const publicFolder = path.resolve(__dirname, "..", "..", "..", "..", "public");

        const files = await ShowFileService(queues[0].fileListId, ticket.companyId)

        const folder = path.resolve(publicFolder, `company${ticket.companyId}`, "fileList", String(files.id))

        for (const [index, file] of files.options.entries()) {
          const mediaSrc = {
            fieldname: 'medias',
            originalname: file.path,
            encoding: '7bit',
            mimetype: file.mediaType,
            filename: file.path,
            path: path.resolve(folder, file.path),
          } as Express.Multer.File

          await SendWhatsAppMedia({ media: mediaSrc, ticket, body: file.name, isForwarded: false });
        };

      } catch (error) {
        logger.info(error);
      }
    }

    if (queues[0].closeTicket) {
      await UpdateTicketService({
        ticketData: {
          status: "closed",
          queueId: queues[0].id,
          sendFarewellMessage: false
        },
        ticketId: ticket.id,
        companyId
      });

      return;
    } else {
      await UpdateTicketService({
        ticketData: { queueId: queues[0].id },
        ticketId: ticket.id,
        companyId
      });
    }

    const count = await Ticket.findAndCountAll({
      where: {
        userId: null,
        status: "pending",
        companyId,
        queueId: queues[0].id,
        isGroup: false
      }
    });

    if (enableQueuePosition) {
      // Lógica para enviar posição da fila de atendimento
      const qtd = count.count === 0 ? 1 : count.count
      const msgFila = `*Assistente Virtual:*\n{{ms}} *{{name}}*, sua posição na fila de atendimento é: *${qtd}*`;
      const bodyFila = formatBody(`${msgFila}`, ticket);
      const debouncedSentMessagePosicao = debounce(
        async () => {
          await wbot.sendMessage(
            `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
            }`,
            {
              text: bodyFila
            }
          );
        },
        3000,
        ticket.id
      );
      debouncedSentMessagePosicao();
    }

    return;
  }


  // REGRA PARA DESABILITAR O BOT PARA ALGUM CONTATO
  if (contact.disableBot) {
    return;
  }

  let selectedOption = "";

  if (ticket.status !== "lgpd") {
    selectedOption =
      msg?.message?.buttonsResponseMessage?.selectedButtonId ||
      msg?.message?.listResponseMessage?.singleSelectReply.selectedRowId ||
      getBodyMessage(msg);
  } else {
    if (!isNil(ticket.lgpdAcceptedAt))
      await ticket.update({
        status: "pending"
      });

    await ticket.reload();
  }

  if (selectedOption.toLocaleLowerCase() == "sair") {
    // Encerra atendimento
    const ticketUpdateAgent = {
      ticketData: {
        status: "closed",
        amountUsedBotQueues: 0
      },
      ticketId: ticket.id,
      companyId: ticket.companyId
    };
    // const ticketData = {
    //   isBot: false,
    //   queueId: null,
    //   userId: null,
    //   status: "closed",
    //   sendFarewellMessage: false,
    //   maxUseBotQueues: 0
    // };

    await UpdateTicketService(ticketUpdateAgent);
    // await ticket.update({ queueOptionId: null, chatbot: false, queueId: null, userId: null, status: "closed"});
    //await verifyQueue(wbot, msg, ticket, ticket.contact);

    const complationMessage = ticket.whatsapp?.complationMessage;

    const textMessage = {
      text: formatBody(`\u200e${complationMessage}`, ticket),
    };

    if (!isNil(complationMessage)) {
      const sendMsg = await wbot.sendMessage(
        `${ticket?.contact?.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        textMessage
      );

      await verifyMessage(sendMsg, ticket, ticket.contact);
    }
    return;
  }

  const choosenQueue = (chatbot && queues.length === 1) ? queues[+selectedOption] : queues[+selectedOption - 1];

  //inicia integração dialogflow/n8n
  if (!msg.key.fromMe && !ticket.isGroup && choosenQueue?.integrationId) {

    const integrations = await ShowQueueIntegrationService(choosenQueue.integrationId, companyId);

    await handleMessageIntegration(msg, wbot, companyId, integrations, ticket)

    await ticket.update({
      useIntegration: true,
      integrationId: integrations.id
    })
    // return;
  }

  //inicia integração openai
  if (!msg.key.fromMe && !ticket.isGroup && !isNil(choosenQueue?.promptId)) {

    await handleOpenAi(msg, wbot, ticket, contact, mediaSent, ticketTraking);

    await ticket.update({
      useIntegration: true,
      promptId: choosenQueue?.promptId
    })
    // return;
  }

  const typeBot = settings?.chatBotType || "text";

  // Serviço p/ escolher consultor aleatório para o ticket, ao selecionar fila.
  let randomUserId;

  if (choosenQueue) {
    try {
      const userQueue = await ListUserQueueServices(choosenQueue.id);

      if (userQueue.userId > -1) {
        randomUserId = userQueue.userId;
      }

    } catch (error) {
      console.error(error);
    }
  }

  // Ativar ou desativar opção de escolher consultor aleatório.
  /*   let settings = await CompaniesSettings.findOne({
      where: {
        companyId: companyId
      }
    }); */



  const botText = async () => {
    if (choosenQueue || (queues.length === 1 && chatbot)) {
      const queue = await Queue.findByPk(choosenQueue.id);

      let currentSchedule;

      if (settings?.scheduleType === "queue") {
        currentSchedule = await VerifyCurrentSchedule(companyId, queue.id, 0);
      }

      if (
        settings?.scheduleType === "queue" &&
        !isNil(currentSchedule) &&
        (!currentSchedule || currentSchedule.inActivity === false)
        && (!ticket.isGroup || ticket.whatsapp?.groupAsTicket === "enabled")
      ) {

        const outOfHoursMessage = queue.outOfHoursMessage;

        if (outOfHoursMessage !== "") {

          const body = formatBody(`${outOfHoursMessage}`, ticket);

          const debouncedSentMessage = debounce(
            async () => {
              await wbot.sendMessage(
                `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
                }`,
                {
                  text: body
                }
              );
            },
            1000,
            ticket.id
          );
          debouncedSentMessage();

          //atualiza o contador de vezes que enviou o bot e que foi enviado fora de hora
          await ticket.update({
            isOutOfHour: true,
            amountUsedBotQueues: ticket.amountUsedBotQueues + 1
          });

          return;

        }
        //atualiza o contador de vezes que enviou o bot e que foi enviado fora de hora
        await ticket.update({
          isOutOfHour: true,
          amountUsedBotQueues: ticket.amountUsedBotQueues + 1
        });
        return;
      }

      await UpdateTicketService({
        ticketData: { amountUsedBotQueues: 0, queueId: choosenQueue.id },
        // ticketData: { queueId: queues.length ===1 ? null : choosenQueue.id },
        ticketId: ticket.id,
        companyId
      });
      // }

      if (choosenQueue.chatbots.length > 0 && !ticket.isGroup) {


        let options = "";
        choosenQueue.chatbots.forEach((chatbot, index) => {
          options += `*[ ${index + 1} ]* - ${chatbot.name}\n`;
        });

        const body = formatBody(
          `\u200e${choosenQueue.greetingMessage}\n\n${options}\n*[ # ]* Voltar para o menu principal\n*[ Sair ]* Encerrar atendimento`,
          ticket
        );

        const sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: body
          }
        );

        await verifyMessage(sentMessage, ticket, contact, ticketTraking);

        if (settings?.settingsUserRandom === "enabled") {
          await UpdateTicketService({
            ticketData: { userId: randomUserId },
            ticketId: ticket.id,
            companyId
          });
        }
      }

      if (!choosenQueue.chatbots.length && choosenQueue.greetingMessage.length !== 0) {
        const body = formatBody(
          `\u200e${choosenQueue.greetingMessage}`,
          ticket
        );
        const sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: body
          }
        );

        await verifyMessage(sentMessage, ticket, contact, ticketTraking);

      }

      if (!isNil(choosenQueue.fileListId)) {
        try {
          const publicFolder = path.resolve(__dirname, "..", "..", "..", "..", "public");

          const files = await ShowFileService(choosenQueue.fileListId, ticket.companyId)

          const folder = path.resolve(publicFolder, `company${ticket.companyId}`, "fileList", String(files.id))

          for (const [index, file] of files.options.entries()) {
            const mediaSrc = {
              fieldname: 'medias',
              originalname: file.path,
              encoding: '7bit',
              mimetype: file.mediaType,
              filename: file.path,
              path: path.resolve(folder, file.path),
            } as Express.Multer.File

            await SendWhatsAppMedia({ media: mediaSrc, ticket, body: `\u200e${file.name}`, isForwarded: false });
          };

        } catch (error) {
          logger.info(error);
        }
      }

      //se fila está parametrizada para encerrar ticket automaticamente
      if (choosenQueue.closeTicket) {
        await UpdateTicketService({
          ticketData: {
            status: "closed",
            queueId: choosenQueue.id,
            sendFarewellMessage: false
          },
          ticketId: ticket.id,
          companyId
        });

        await CreateLogTicketService({
          ticketId: ticket.id,
          type: "closed",
          queueId: choosenQueue.id
        });

        return;
      }

      const count = await Ticket.findAndCountAll({
        where: {
          userId: null,
          status: "pending",
          companyId,
          queueId: choosenQueue.id,
          isGroup: false
        }
      });

      await CreateLogTicketService({
        ticketId: ticket.id,
        type: "queue",
        queueId: choosenQueue.id
      });

      if (enableQueuePosition && !choosenQueue.chatbots.length) {
        // Lógica para enviar posição da fila de atendimento
        const qtd = count.count === 0 ? 1 : count.count
        const msgFila = `*Assistente Virtual:*\n{{ms}} *{{name}}*, sua posição na fila de atendimento é: *${qtd}*`;
        const bodyFila = formatBody(`${msgFila}`, ticket);
        const debouncedSentMessagePosicao = debounce(
          async () => {
            await wbot.sendMessage(
              `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
              }`,
              {
                text: bodyFila
              }
            );
          },
          3000,
          ticket.id
        );
        debouncedSentMessagePosicao();
      }


    } else {

      if (ticket.isGroup) return;

      if (maxUseBotQueues && maxUseBotQueues !== 0 && ticket.amountUsedBotQueues >= maxUseBotQueues) {
        // await UpdateTicketService({
        //   ticketData: { queueId: queues[0].id },
        //   ticketId: ticket.id
        // });

        return;
      }

      //Regra para desabilitar o chatbot por x minutos/horas após o primeiro envio
      const ticketTraking = await FindOrCreateATicketTrakingService({ ticketId: ticket.id, companyId });
      let dataLimite = new Date();
      let Agora = new Date();


      if (ticketTraking.chatbotAt !== null) {
        dataLimite.setMinutes(ticketTraking.chatbotAt.getMinutes() + (Number(timeUseBotQueues)));

        if (ticketTraking.chatbotAt !== null && Agora < dataLimite && timeUseBotQueues !== "0" && ticket.amountUsedBotQueues !== 0) {
          return
        }
      }
      await ticketTraking.update({
        chatbotAt: null,
        contactId: ticket.contactId,
        status: ticket.status,
        queueId: ticket.queueId,
        userId: ticket.userId,
        lastMessage: await resolveMentions(msg, getBodyMessage(msg), companyId)
      })


      let options = "";


      queues.forEach((queue, index) => {
        options += `*[ ${index + 1} ]* - ${queue.name}\n`;
      });
      options += `\n*[ Sair ]* - Encerrar atendimento `;

      const body = formatBody(`\u200e${greetingMessage}\n\n${options}`, ticket);




      await CreateLogTicketService({
        ticketId: ticket.id,
        type: "chatBot"
      });

      if (ticket.whatsapp.greetingMediaAttachment !== null) {
        const filePath = path.resolve("public", `company${companyId}`, ticket.whatsapp.greetingMediaAttachment);

        const messagePath = ticket.whatsapp.greetingMediaAttachment
        const optionsMsg = await getMessageOptions(messagePath, filePath, String(companyId), body);

        let sentMessage = await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, { ...optionsMsg });

        if (ticket.amountUsedBotQueues > 0) {
          await sleep(1000);

          await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
            text: 'Opção inválida, por favor escolha uma opção válida abaixo:',
          });

          await sleep(500);

        }

        await verifyMediaMessage(sentMessage, ticket, contact, ticketTraking);

        await UpdateTicketService({
          ticketData: { amountUsedBotQueues: ticket.amountUsedBotQueues + 1 },
          ticketId: ticket.id,
          companyId
        });

        return
      } else {


        if (ticket.amountUsedBotQueues > 0) {
          await sleep(1000);

          await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
            text: 'Opção inválida, por favor escolha uma opção válida abaixo:',
          });

          await sleep(500);

        }

        const debouncedSentMessage = debounce(
          async () => {
            const sentMessage = await wbot.sendMessage(
              `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
              {
                text: body
              }
            );

            verifyMessage(sentMessage, ticket, contact, ticketTraking);
          },
          1000,
          ticket.id
        );

        await UpdateTicketService({
          ticketData: { amountUsedBotQueues: ticket.amountUsedBotQueues + 1 },
          ticketId: ticket.id,
          companyId
        });

        debouncedSentMessage();
      }
    }
  };

  const botButton = async () => {
    if (choosenQueue) {

      // if (settingsUserRandom?.value === "enabled") {
      //   await UpdateTicketService({
      //     ticketData: { queueId: choosenQueue.id, userId: randomUserId },
      //     ticketId: ticket.id,
      //     companyId: companyId,
      //     ratingId: undefined
      //   });
      // }
      // else {
      await UpdateTicketService({
        ticketData: { queueId: choosenQueue.id },
        ticketId: ticket.id,
        companyId: companyId
      });
      // }

      if (choosenQueue.chatbots.length > 0) {
        const buttons = [];
        choosenQueue.chatbots.forEach((queue, index) => {
          buttons.push({
            buttonId: `${index + 1}`,
            buttonText: { displayText: queue.name },
            type: 1
          });
        });

        const buttonMessage = {
          text: formatBody(`${choosenQueue.greetingMessage}`, ticket),
          buttons,
          headerType: 4
        };

        const sendMsg = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          buttonMessage
        );

        await verifyMessage(sendMsg, ticket, contact, ticketTraking);
      }

      if (!choosenQueue.chatbots.length) {
        const body = formatBody(
          `${choosenQueue.greetingMessage}`,
          ticket
        );
        const sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: body
          }
        );

        await verifyMessage(sentMessage, ticket, contact, ticketTraking);
      }
    } else {
      const buttons = [];
      queues.forEach((queue, index) => {
        buttons.push({
          buttonId: `${index + 1}`,
          buttonText: { displayText: queue.name },
          type: 4
        });
      });

      const buttonMessage = {
        text: formatBody(`${greetingMessage}`, ticket),
        footer: "",
        buttons: buttons,
        headerType: 4
      };

      const sendMsg = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        buttonMessage
      );

      await verifyMessage(sendMsg, ticket, contact, ticketTraking);

      await UpdateTicketService({
        ticketData: { amountUsedBotQueues: ticket.amountUsedBotQueues + 1 },
        ticketId: ticket.id,
        companyId: companyId
      });

    }
  };

  const botList = async () => {
    if (choosenQueue) {

      // if (settingsUserRandom?.value === "enabled") {
      //   await UpdateTicketService({
      //     ticketData: { queueId: choosenQueue.id, userId: randomUserId },
      //     ticketId: ticket.id,
      //     companyId: companyId,
      //     ratingId: undefined
      //   });
      // }
      // else {
      await UpdateTicketService({
        ticketData: { queueId: choosenQueue.id },
        ticketId: ticket.id,
        companyId: companyId
      });
      // }

      if (choosenQueue.chatbots.length > 0) {
        const sectionsRows = [];
        choosenQueue.chatbots.forEach((queue, index) => {
          sectionsRows.push({
            title: queue.name,
            rowId: `${index + 1}`
          });
        });

        const sections = [
          {
            title: "Menu",
            rows: sectionsRows
          }
        ];

        const listMessage = {
          text: formatBody(`${choosenQueue.greetingMessage}`, ticket),
          buttonText: "Escolha uma opção",
          sections
        };

        const sendMsg = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          listMessage
        );

        await verifyMessage(sendMsg, ticket, contact, ticketTraking);
      }

      if (!choosenQueue.chatbots.length) {
        const body = formatBody(
          `${choosenQueue.greetingMessage}`,
          ticket
        );

        const sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: body
          }
        );

        await verifyMessage(sentMessage, ticket, contact, ticketTraking);
      }
    } else {
      const sectionsRows = [];

      queues.forEach((queue, index) => {
        sectionsRows.push({
          title: queue.name,
          rowId: `${index + 1}`
        });
      });

      const sections = [
        {
          title: "Menu",
          rows: sectionsRows
        }
      ];

      const listMessage = {
        text: formatBody(`${greetingMessage}`, ticket),
        buttonText: "Escolha uma opção",
        sections
      };

      const sendMsg = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        listMessage
      );

      await verifyMessage(sendMsg, ticket, contact, ticketTraking);

      await UpdateTicketService({
        ticketData: { amountUsedBotQueues: ticket.amountUsedBotQueues + 1 },
        ticketId: ticket.id,
        companyId: companyId
      });
    }
  };

  if (typeBot === "text") {
    return botText();
  }

  if (typeBot === "button" && queues.length > 3) {
    return botText();
  }

  if (typeBot === "button" && queues.length <= 3) {
    return botButton();
  }

  if (typeBot === "list") {
    return botList();
  }
};

export const verifyRating = (ticketTraking: TicketTraking) => {

  if (
    ticketTraking &&
    ticketTraking.finishedAt === null &&
    ticketTraking.closedAt !== null &&
    ticketTraking.ratingAt === null
  ) {
    return true;
  }
  return false;
};

export const handleRating = async (
  rate: number,
  ticket: Ticket,
  ticketTraking: TicketTraking
) => {
  const io = getIO();
  const companyId = ticket.companyId;

  const { complationMessage } = await ShowWhatsAppService(
    ticket.whatsappId,
    companyId
  );

  let finalRate = rate;

  if (rate < 0) {
    finalRate = 0;
  }
  if (rate > 10) {
    finalRate = 10;
  }

  await UserRating.create({
    ticketId: ticketTraking.ticketId,
    companyId: ticketTraking.companyId,
    userId: ticketTraking.userId,
    ticketTrakingId: ticketTraking.id,
    rate: finalRate,
  });

  if (!isNil(complationMessage) && complationMessage !== "" && !ticket.isGroup) {

    const body = formatBody(`\u200e${complationMessage}`, ticket);
    if (ticket.channel === "whatsapp") {
      const msg = await SendWhatsAppMessage({ body, ticket });

      await verifyMessage(msg, ticket, ticket.contact, ticketTraking);

    }

    if (["facebook", "instagram"].includes(ticket.channel)) {
      await sendFaceMessage({ body, ticket });
    }
  }

  await ticket.update({
    chatbot: null,
    status: "closed",
    amountUseBotQueuesNPS: 0
  });

  //loga fim de atendimento
  await CreateLogTicketService({
    userId: ticket.userId,
    queueId: ticket.queueId,
    ticketId: ticket.id,
    type: "closed"
  });

  io.to("open").emit(`company-${companyId}-ticket`, {
    action: "delete",
    ticket,
    ticketId: ticket.id,
  });

  io.to(ticket.status)
    .to(ticket.id.toString())
    .emit(`company-${companyId}-ticket`, {
      action: "update",
      ticket,
      ticketId: ticket.id
    });

};

export const handleMessageIntegration = async (
  msg: proto.IWebMessageInfo,
  wbot: Session,
  companyId: number,
  queueIntegration: QueueIntegrations,
  ticket: Ticket
): Promise<void> => {
  const msgType = getTypeMessage(msg);

  if (queueIntegration.type === "n8n" || queueIntegration.type === "webhook") {
    if (queueIntegration?.urlN8N) {
      const options = {
        method: "POST",
        url: queueIntegration?.urlN8N,
        headers: {
          "Content-Type": "application/json"
        },
        json: msg
      };
      try {
        request(options, function (error, response) {
          if (error) {
            throw new Error(error);
          }
          else {
            console.log(response.body);
          }
        });
      } catch (error) {
        throw new Error(error);
      }
    }

  } else if (queueIntegration.type === "dialogflow") {
    let inputAudio: string | undefined;

    if (msgType === "audioMessage") {
      let filename = `${msg.messageTimestamp}.ogg`;
      readFile(
        join(__dirname, "..", "..", "..", "public", `company${companyId}`, filename),
        "base64",
        (err, data) => {
          inputAudio = data;
          if (err) {
            logger.error(err);
          }
        }
      );
    } else {
      inputAudio = undefined;
    }

    const debouncedSentMessage = debounce(
      async () => {
        await sendDialogflowAwswer(
          wbot,
          ticket,
          msg as any,
          ticket.contact,
          inputAudio,
          companyId,
          queueIntegration
        );
      },
      500,
      ticket.id
    );
    debouncedSentMessage();
  } else if (queueIntegration.type === "typebot") {
    await typebotListener({ ticket, msg, wbot, typebot: queueIntegration });
  }
}

const IsMessageForwarded = (msg: proto.IWebMessageInfo): boolean => {
  const isMsgForwarded =
    msg.message?.extendedTextMessage?.contextInfo?.isForwarded ||
    msg.message?.imageMessage?.contextInfo?.isForwarded ||
    msg.message?.audioMessage?.contextInfo?.isForwarded ||
    msg.message?.videoMessage?.contextInfo?.isForwarded ||
    msg.message?.documentMessage?.contextInfo?.isForwarded

  return isMsgForwarded;
}

const hasMediaMessage = (msg: proto.IWebMessageInfo): boolean => {
  const hasMedia =
    msg.message?.audioMessage ||
    msg.message?.imageMessage ||
    msg.message?.videoMessage ||
    msg.message?.documentMessage ||
    msg.message.stickerMessage ||
    // msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
    // msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage ||
    // msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage ||
    msg?.message?.ephemeralMessage?.message?.imageMessage ||
    msg?.message?.ephemeralMessage?.message?.audioMessage ||
    msg?.message?.ephemeralMessage?.message?.videoMessage ||
    msg?.message?.ephemeralMessage?.message?.documentMessage ||
    msg?.message?.ephemeralMessage?.message?.stickerMessage ||
    msg.message?.viewOnceMessage?.message?.imageMessage ||
    msg.message?.viewOnceMessage?.message?.videoMessage ||
    msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.imageMessage ||
    msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.videoMessage ||
    msg.message?.documentWithCaptionMessage?.message?.documentMessage;

  return !!hasMedia
}

const handleMessage = async (
  msg: proto.IWebMessageInfo,
  wbot: Session,
  companyId: number,
  isImported: boolean = false,
): Promise<void> => {

  if (isImported) {
    addLogs({ fileName: `processImportMessagesWppId${wbot.id}.txt`, text: `Importando Mensagem: ${JSON.stringify(msg, null, 2)}>>>>>>>>>>>>>>>>>>>` })

    let wid = msg.key.id
    let existMessage = await Message.findOne({
      where: { wid }
    })
    if (existMessage) {
      console.log("Esta mensagem já existe")
      return
    } else {
      await new Promise(r => setTimeout(r, parseInt(process.env.TIMEOUT_TO_IMPORT_MESSAGE) || 330));
    }
  }


  let mediaSent: Message | undefined;

  if (!isValidMsg(msg)) {
    return;
  }

  try {
    let msgContact: IMe;
    let groupContact: Contact | undefined;
    let queueId: number = 0;
    let tagsId: number = 0;
    let userId: number = 0;

    let bodyMessage = getBodyMessage(msg);
    const msgType = getTypeMessage(msg);

    // if (msgType === "protocolMessage") return; // Tratar isso no futuro para excluir msgs se vor REVOKE

    const hasMedia = hasMediaMessage(msg);


    if (msg.key.fromMe) {
      if (/\u200e/.test(bodyMessage)) return;
      if (
        !hasMedia &&
        msgType !== "conversation" &&
        msgType !== "extendedTextMessage" &&
        msgType !== "contactMessage" &&
        msgType !== "reactionMessage" &&
        msgType !== "ephemeralMessage" &&
        msgType !== "protocolMessage" &&
        msgType !== "viewOnceMessage" &&
        msgType !== "editedMessage" &&
        msgType !== "pollCreationMessage" &&
        msgType !== "pollUpdateMessage" &&
        msgType !== "interactiveMessage" &&
        msgType !== "interactiveResponseMessage" &&
        msgType !== "orderMessage" &&
        msgType !== "productMessage" &&
        msgType !== "templateMessage" &&
        msgType !== "albumMessage" &&
        msgType !== "groupInviteMessage"
      )
        return;
      msgContact = await getContactMessage(msg, wbot);
    } else {
      msgContact = await getContactMessage(msg, wbot);
    }

    const isGroup = msg.key.remoteJid?.endsWith("@g.us");

    // IGNORAR MENSAGENS DE GRUPO
    // const msgIsGroupBlock = await Settings.findOne({
    //   where: { key: "CheckMsgIsGroup", companyId }
    // });
    const whatsapp = await ShowWhatsAppService(wbot.id!, companyId);

    if (!whatsapp.allowGroup && isGroup) return;

    if (isGroup) {
      const groupMetaCacheKey = `groupMeta:${msg.key.remoteJid}`;
      let grupoMeta: any;
      const cachedMeta = await cacheLayer.get(groupMetaCacheKey);
      if (cachedMeta) {
        grupoMeta = JSON.parse(cachedMeta);
      } else {
        grupoMeta = await wbot.groupMetadata(msg.key.remoteJid);
        await cacheLayer.set(groupMetaCacheKey, JSON.stringify(grupoMeta), "EX", 300);
      }
      const msgGroupContact = {
        id: grupoMeta.id,
        name: grupoMeta.subject
      };
      groupContact = await verifyContact(msgGroupContact, wbot, companyId);
    }


    const contact = await verifyContact(msgContact, wbot, companyId);

    if (!contact) {
      logger.warn(`[handleMessage] Contato não pôde ser criado/encontrado para ${msgContact?.id}, mensagem ignorada`);
      return;
    }

    let unreadMessages = 0;
    let ticket = null;

    if (msg.key.fromMe) {
      await cacheLayer.set(`contacts:${contact.id}:unreads`, "0");
    } else {
      const unreads = await cacheLayer.get(`contacts:${contact.id}:unreads`);
      unreadMessages = +unreads + 1;
      await cacheLayer.set(
        `contacts:${contact.id}:unreads`,
        `${unreadMessages}`
      );
    }

    const settingsCacheKey = `companySettings:${companyId}`;
    let settings: any;
    const cachedSettings = await cacheLayer.get(settingsCacheKey);
    if (cachedSettings) {
      settings = JSON.parse(cachedSettings);
    } else {
      settings = await CompaniesSettings.findOne({ where: { companyId } });
      await cacheLayer.set(settingsCacheKey, JSON.stringify(settings), "EX", 60);
    }
    const enableLGPD = settings.enableLGPD === "enabled";

    // contador
    // if (msg.key.fromMe && count?.unreadCount > 0) {
    //   let remoteJid = msg.key.remoteJid;
    //   SendAckBYRemoteJid({ remoteJid, companyId });
    // }

    // Inclui a busca de ticket aqui, se realmente não achar um ticket, então vai para o findorcreate

    const { ticket: tck, isCreated } = await FindOrCreateTicketService(
      contact,
      whatsapp,
      unreadMessages,
      companyId,
      queueId,
      userId,
      groupContact,
      "whatsapp",
      isImported,
      false,
      settings,
    );

    ticket = tck;
    await provider(ticket, msg, companyId, contact, wbot as WASocket);

    if (
      ticket.status === 'closed' ||
      (
        unreadMessages === 0 &&
        whatsapp.complationMessage &&
        formatBody(whatsapp.complationMessage, ticket) === bodyMessage
      )
    ) {
      return;
    }


    if (msgType === "editedMessage" || msgType === "protocolMessage") {

      const msgKeyIdEdited = msgType === "editedMessage" ? msg.message.editedMessage.message.protocolMessage.key.id : msg.message?.protocolMessage.key.id;
      const bodyEdited = msgType === "editedMessage" ? msg.message.editedMessage.message.protocolMessage.editedMessage.conversation : msg.message.protocolMessage?.editedMessage?.extendedTextMessage?.text || msg.message.protocolMessage?.editedMessage?.conversation;
      const io = getIO();

      try {
        const messageToUpdate = await Message.findOne({
          where: {
            wid: msgKeyIdEdited,
            companyId,
            ticketId: ticket.id
          }
        })

        if (!messageToUpdate) return

        await messageToUpdate.update({ isEdited: true, body: bodyEdited });

        await ticket.update({ lastMessage: bodyEdited })

        // await ticketTraking.update({
        //   lastMessage: bodyEdited,
        // });

        io.to(messageToUpdate.ticketId.toString())
          .to(ticket.status)
          .emit(`company-${companyId}-appMessage`, {
            action: "update",
            message: messageToUpdate,
            ticket: ticket,
            contact: ticket.contact
          });

        io.to(ticket.status)
          .to("notification")
          .to(String(ticket.id))
          .emit(`company-${companyId}-ticket`, {
            action: "update",
            ticket
          });
      } catch (err) {
        Sentry.captureException(err);
        logger.error(`Error handling message ack. Err: ${err}`);
      }
      return
    }


    const ticketTraking = await FindOrCreateATicketTrakingService({
      ticketId: ticket.id,
      companyId,
      whatsappId: whatsapp?.id
    });



    try {
      if (!msg.key.fromMe) {
        /**
         * Tratamento para avaliação do atendente
         */

        if (ticket.status === "nps" && ticketTraking !== null && verifyRating(ticketTraking)) {

          if (!isNaN(parseFloat(bodyMessage))) {

            handleRating(parseFloat(bodyMessage), ticket, ticketTraking);

            await ticketTraking.update({
              ratingAt: moment().toDate(),
              finishedAt: moment().toDate(),
              rated: true,
              status: "closed"
            });

            return;
          } else {

            if (ticket.amountUseBotQueuesNPS < whatsapp.maxUseBotQueuesNPS) {

              let bodyErrorRating = `\u200eOpção inválida, tente novamente.\n`;
              const sentMessage = await wbot.sendMessage(
                `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
                }`,
                {
                  text: bodyErrorRating
                }
              );

              verifyMessage(sentMessage, ticket, contact, ticketTraking);


              await delay(1000);

              let bodyRatingMessage = `\u200e${whatsapp.ratingMessage}\n`;

              const msg = await SendWhatsAppMessage({ body: bodyRatingMessage, ticket });

              await verifyMessage(msg, ticket, ticket.contact);

              await ticket.update({
                amountUseBotQueuesNPS: ticket.amountUseBotQueuesNPS + 1
              })
            }
            return;
          }

        }

        //TRATAMENTO LGPD
        if (enableLGPD && ticket.status === "lgpd" && !isImported) {
          if (isNil(ticket.lgpdAcceptedAt) && !isNil(ticket.lgpdSendMessageAt)) {
            let choosenOption: number | null = null;

            if (msg?.message?.conversation) {
              choosenOption = ~~+msg.message?.conversation;
            }

            //Se digitou opção numérica
            if (!Number.isNaN(choosenOption) && Number.isInteger(choosenOption) && !isNull(choosenOption) && choosenOption > 0) {
              //Se digitou 1, aceitou o termo e vai pro bot
              if (choosenOption === 1) {
                await contact.update({
                  lgpdAcceptedAt: moment().toDate(),
                });
                if(
                    whatsapp?.queues.length === 0 &&
                    !whatsapp.integrationId &&
                    !whatsapp.promptId
                  ){
                    await ticket.update({
                      lgpdAcceptedAt: moment().toDate(),
                      amountUsedBotQueues: 0,
                      status: 'pending'
                    });
                  }else{
                    await ticket.update({
                      lgpdAcceptedAt: moment().toDate(),
                      amountUsedBotQueues: 0,
                    });
                  }
                //return
                //Se digitou 2, recusou o bot e encerra chamado
              } else if (choosenOption === 2) {

                if (whatsapp.complationMessage !== "" && whatsapp.complationMessage !== undefined) {

                  const sentMessage = await wbot.sendMessage(
                    `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
                    }`,
                    {
                      text: `\u200e${whatsapp.complationMessage}`
                    }
                  );

                  verifyMessage(sentMessage, ticket, contact, ticketTraking);
                }

                await ticket.update({
                  status: "closed",
                  amountUsedBotQueues: 0
                })

                await ticketTraking.destroy;

                return
                //se digitou qualquer opção que não seja 1 ou 2 limpa o lgpdSendMessageAt para
                //enviar de novo o bot respeitando o numero máximo de vezes que o bot é pra ser enviado
              } else {
                if (ticket.amountUsedBotQueues < whatsapp.maxUseBotQueues) {
                  await ticket.update(
                    {
                      amountUsedBotQueues: ticket.amountUsedBotQueues + 1
                      , lgpdSendMessageAt: null
                    });
                }
              }
              //se digitou qualquer opção que não número o lgpdSendMessageAt para
              //enviar de novo o bot respeitando o numero máximo de vezes que o bot é pra ser enviado
            } else {
              if (ticket.amountUsedBotQueues < whatsapp.maxUseBotQueues) {
                await ticket.update(
                  {
                    amountUsedBotQueues: ticket.amountUsedBotQueues + 1
                    , lgpdSendMessageAt: null
                  });
              }
            }
          }

          if ((contact.lgpdAcceptedAt === null || settings?.lgpdConsent === "enabled") &&
            !contact.isGroup && isNil(ticket.lgpdSendMessageAt) &&
            ticket.amountUsedBotQueues <= whatsapp.maxUseBotQueues && !isNil(settings?.lgpdMessage)
          ) {
            if (hasMedia) {
              mediaSent = await verifyMediaMessage(msg, ticket, contact);
            } else {
              await verifyMessage(msg, ticket, contact, ticketTraking);
            }

            if (!isNil(settings?.lgpdMessage) && settings.lgpdMessage !== "") {
              const bodyMessageLGPD = formatBody(`\u200e${settings?.lgpdMessage}`, ticket);

              const sentMessage = await wbot.sendMessage(
                `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
                }`,
                {
                  text: bodyMessageLGPD
                }
              );

              verifyMessage(sentMessage, ticket, contact, ticketTraking);

            }
            await delay(1000);

            if (!isNil(settings?.lgpdLink) && settings?.lgpdLink !== "") {
              const bodyLink = formatBody(`\u200e${settings?.lgpdLink}`, ticket);
              const sentMessage = await wbot.sendMessage(
                `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
                }`,
                {
                  text: bodyLink
                }
              );

              await verifyMessage(sentMessage, ticket, contact, ticketTraking);
            };

            await delay(1000);

            const bodyBot = formatBody(
              `\u200eEstou ciente sobre o tratamento dos meus dados pessoais. \n\n*[1]* Sim\n*[2]* Não`,
              ticket
            );

            const sentMessageBot = await wbot.sendMessage(
              `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
              }`,
              {
                text: bodyBot
              }

            );

            await verifyMessage(sentMessageBot, ticket, contact, ticketTraking);

            await ticket.update({
              lgpdSendMessageAt: moment().toDate(),
              amountUsedBotQueues: ticket.amountUsedBotQueues + 1
            });

            await ticket.reload();

            return;

          };

          if (!isNil(ticket.lgpdSendMessageAt) && isNil(ticket.lgpdAcceptedAt))
            return
        }
      }
    } catch (e) {
      Sentry.captureException(e);
      console.log(e);
    }

    if (hasMedia) {
      mediaSent = await verifyMediaMessage(msg, ticket, contact, ticketTraking, IsMessageForwarded(msg));
    } else {
      await verifyMessage(msg, ticket, contact, ticketTraking, false, IsMessageForwarded(msg));
    }


    // Atualiza o ticket se a ultima mensagem foi enviada por mim, para que possa ser finalizado.
    try {
      await ticket.update({
        fromMe: msg.key.fromMe,
      });
    } catch (e) {
      Sentry.captureException(e);
      console.log(e);
    }

    let currentSchedule;

    if (settings.scheduleType === "company") {
      currentSchedule = await VerifyCurrentSchedule(companyId, 0, 0);
    } else if (settings.scheduleType === "connection") {
      currentSchedule = await VerifyCurrentSchedule(companyId, 0, whatsapp.id);
    }

    try {
      if (!msg.key.fromMe && settings.scheduleType && (!ticket.isGroup || whatsapp.groupAsTicket === "enabled")) {
        /**
         * Tratamento para envio de mensagem quando a empresa está fora do expediente
         */

        if (
          (settings.scheduleType === "company" || settings.scheduleType === "connection") &&
          !isNil(currentSchedule) &&
          (!currentSchedule || currentSchedule.inActivity === false) &&
          (ticket.status !== 'open' || settings.sendMessageOutExpedientTicketOpen === "enabled")
        ) {
          if (ticketTraking.chatbotAt === null) {
            await ticketTraking.update({
              chatbotAt: moment().toDate(),
            })
          }

          if (whatsapp.maxUseBotQueues && whatsapp.maxUseBotQueues !== 0 && ticket.amountUsedBotQueues >= whatsapp.maxUseBotQueues) {
            // await UpdateTicketService({
            //   ticketData: { queueId: queues[0].id },
            //   ticketId: ticket.id
            // });

            return;
          }

          //Regra para desabilitar o chatbot por x minutos/horas após o primeiro envio
          let dataLimite = new Date();
          let Agora = new Date();


          if (ticketTraking.chatbotAt !== null) {
            dataLimite.setMinutes(ticketTraking.chatbotAt.getMinutes() + (Number(whatsapp.timeUseBotQueues)));

            if (ticketTraking.chatbotAt !== null && Agora < dataLimite && whatsapp.timeUseBotQueues !== "0" && ticket.amountUsedBotQueues !== 0) {
              return
            }
          }

          await ticketTraking.update({
            chatbotAt: null
          })

          if (whatsapp.outOfHoursMessage !== "") {

            const body = formatBody(`${whatsapp.outOfHoursMessage}`, ticket);

            const debouncedSentMessage = debounce(
              async () => {
                await wbot.sendMessage(
                  `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
                  }`,
                  {
                    text: body
                  }
                );
              },
              1000,
              ticket.id
            );
            debouncedSentMessage();

            //atualiza o contador de vezes que enviou o bot e que foi enviado fora de hora
            await ticket.update({
              isOutOfHour: true,
              amountUsedBotQueues: ticket.amountUsedBotQueues + 1
            });

            return;

          }

          //atualiza o contador de vezes que enviou o bot e que foi enviado fora de hora
          await ticket.update({
            isOutOfHour: true,
            amountUsedBotQueues: ticket.amountUsedBotQueues + 1
          });

          return;
        }
      }
    } catch (e) {
      Sentry.captureException(e);
      console.log(e);
    }

    //integraçao na conexao
    if (
      !msg.key.fromMe &&
      !contact.disableBot &&
      !ticket.userId &&
      whatsapp?.integrationId > 0 &&
      (ticket?.status !== 'nps')
    ) {

      const integration = await ShowQueueIntegrationService(whatsapp.integrationId, companyId);

      await handleMessageIntegration(msg, wbot, companyId, integration, ticket);

      await ticket.update({
        useIntegration: true,
        integrationId: integration.id
      })

      if ((ticket.status === "lgpd") && !isNil(ticket.lgpdAcceptedAt)){
        await ticket.update({
          status: "pending"
        });
        await ticket.reload();
      }

      return
    }

    //openai na conexao
    if (
      !ticket.imported &&
      !ticket.queue &&
      !isGroup &&
      !msg.key.fromMe &&
      !ticket.userId &&
      !contact.disableBot &&
      !isNil(whatsapp.promptId) &&
      (ticket?.status !== 'nps')
    ) {
      await handleOpenAi(msg, wbot, ticket, contact, mediaSent, ticketTraking);
      if ((ticket.status === "lgpd") && !isNil(ticket.lgpdAcceptedAt)){
        await ticket.update({
          status: "pending"
        });
        await ticket.reload();
      }
    }


    if (
      !msg.key.fromMe &&
      (!ticket.isGroup || whatsapp.groupAsTicket === "enabled") &&
      ticket.queue &&
      ticket.integrationId &&
      !contact.disableBot &&
      ticket.useIntegration &&
      !ticket.userId &&
      (ticket?.status !== 'nps')
    ) {

      const integrations = await ShowQueueIntegrationService(ticket.integrationId, companyId);

      await handleMessageIntegration(msg, wbot, companyId, integrations, ticket)
      if ((ticket.status === "lgpd") && !isNil(ticket.lgpdAcceptedAt)){
        await ticket.update({
          status: "pending"
        });
        await ticket.reload();
      }

      return
    }

    //openai na fila
    if (
      !ticket.imported &&
      !isGroup &&
      !contact.disableBot &&
      !msg.key.fromMe &&
      !ticket.userId &&
      !isNil(ticket.promptId) &&
      ticket.useIntegration &&
      ticket.queueId &&
      (ticket?.status !== 'nps')
    ) {

      await handleOpenAi(msg, wbot, ticket, contact, mediaSent, ticketTraking);
      if ((ticket.status === "lgpd") && !isNil(ticket.lgpdAcceptedAt)){
        await ticket.update({
          status: "pending"
        });
        await ticket.reload();
      }
    }

    if (
      !ticket.imported &&
      !ticket.queue &&
      (!ticket.isGroup || whatsapp.groupAsTicket === "enabled") &&
      !msg.key.fromMe &&
      !ticket.userId &&
      !contact.disableBot &&
      whatsapp.queues.length >= 1 &&
      (ticket?.status !== 'nps')
    ) {

      await verifyQueue(wbot, msg, ticket, contact, mediaSent, settings);

      if (ticketTraking.chatbotAt === null) {
        await ticketTraking.update({
          chatbotAt: moment().toDate(),
        })
      }
    }

    if (ticket.queueId > 0) {
      await ticketTraking.update({
        queueId: ticket.queueId
      })
    }

    // Verificação se aceita audio do contato
    if (
      (getTypeMessage(msg) === "audioMessage" || getTypeMessage(msg) === "videoMessage") &&
      !msg.key.fromMe &&
      (!ticket.isGroup || whatsapp.groupAsTicket === "enabled") &&
      (!contact?.acceptAudioMessage ||
        settings?.acceptAudioMessageContact === "disabled")
    ) {
      const sentMessage = await wbot.sendMessage(
        `${contact.number}@c.us`,
        {
          text: `\u200e*Assistente Virtual*:\nInfelizmente não conseguimos escutar nem enviar áudios por este canal de atendimento, por favor, envie uma mensagem de *texto*.`
        },
        {
          quoted: {
            key: msg.key,
            message: {
              extendedTextMessage: msg.message.extendedTextMessage
            }
          }
        }
      );
      await verifyMessage(sentMessage, ticket, contact, ticketTraking);
    }


    try {
      if (!msg.key.fromMe && settings?.scheduleType && ticket.queueId !== null && (!ticket.isGroup || whatsapp.groupAsTicket === "enabled")) {
        /**
         * Tratamento para envio de mensagem quando a empresa/fila está fora do expediente
         */

        const queue = await Queue.findByPk(ticket.queueId)

        if (settings?.scheduleType === "queue") {
          currentSchedule = await VerifyCurrentSchedule(companyId, queue.id, 0);
        }

        if (
          settings?.scheduleType === "queue" &&
          !isNil(currentSchedule) &&
          (!currentSchedule || currentSchedule.inActivity === false) &&
          (ticket.status !== open || settings.sendMessageOutExpedientTicketOpen === 'enabled')
        ) {

          const outOfHoursMessage = queue.outOfHoursMessage;

          if (outOfHoursMessage !== "") {

            const body = formatBody(`${outOfHoursMessage}`, ticket);

            const debouncedSentMessage = debounce(
              async () => {
                await wbot.sendMessage(
                  `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
                  }`,
                  {
                    text: body
                  }
                );
              },
              1000,
              ticket.id
            );
            debouncedSentMessage();

            //atualiza o contador de vezes que enviou o bot e que foi enviado fora de hora
            await ticket.update({
              isOutOfHour: true,
              amountUsedBotQueues: ticket.amountUsedBotQueues + 1
            });

            return;

          }
          //atualiza o contador de vezes que enviou o bot e que foi enviado fora de hora
          await ticket.update({
            isOutOfHour: true,
            amountUsedBotQueues: ticket.amountUsedBotQueues + 1
          });
          return;
        }
      }
    } catch (e) {
      Sentry.captureException(e);
      console.log(e);
    }


    if (
      ticket.queue &&
      ticket.queueId &&
      !contact.disableBot &&
      !msg.key.fromMe &&
      (ticket?.status !== 'nps') &&
      ( settings?.asaas &&
        (
          ticket?.queue?.name !== "2ª Via de Boleto" ||
          ticket?.queue?.name !== "2 Via de Boleto"
        )  ||
        (
          !settings?.asaas ||
          settings?.asaas.trim() === ""
        )
      )
    ) {
      if (!ticket.user || ticket.queue?.chatbots?.length > 0) {
        await sayChatbot(ticket.queueId, wbot, ticket, contact, msg);
      }

      //atualiza mensagem para indicar que houve atividade e aí contar o tempo novamente para enviar mensagem de inatividade
      await ticket.update({
        sendInactiveMessage: false
      });
    }

    await ticket.reload();

  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
    logger.error(`Error handling whatsapp message: Err: ${err}`);
  }
};

const handleMsgAck = async (
  msg: WAMessage,
  chat: number | null | undefined
) => {
  await new Promise(r => setTimeout(r, 500));
  const io = getIO();

  try {
    const messageToUpdate = await Message.findOne({
      where: {
        wid: msg.key.id,
      },
      include: [
        "contact",
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"],
        },
      ],
    });

    if (!messageToUpdate) return;

    await messageToUpdate.update({ ack: chat });
    io.to(messageToUpdate.ticketId.toString()).emit(
      `company-${messageToUpdate.companyId}-appMessage`,
      {
        action: "update",
        message: messageToUpdate
      }
    );
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Error handling message ack. Err: ${err}`);
  }
};

const verifyRecentCampaign = async (
  message: proto.IWebMessageInfo,
  companyId: number
) => {
  if (!isValidMsg(message)) {
    return;
  }
  if (!message.key.fromMe) {
    const number = message.key.remoteJid.replace(/\D/g, "");
    const campaigns = await Campaign.findAll({
      where: { companyId, status: "EM_ANDAMENTO", confirmation: true }
    });
    if (campaigns) {
      const ids = campaigns.map(c => c.id);
      const campaignShipping = await CampaignShipping.findOne({
        where: { campaignId: { [Op.in]: ids }, number, confirmation: null }
      });

      if (campaignShipping) {
        await campaignShipping.update({
          confirmedAt: moment(),
          confirmation: true
        });
        await campaignQueue.add(
          "DispatchCampaign",
          {
            campaignShippingId: campaignShipping.id,
            campaignId: campaignShipping.campaignId
          },
          {
            delay: parseToMilliseconds(randomValue(0, 10))
          }
        );
      }
    }
  }
};

const verifyCampaignMessageAndCloseTicket = async (message: proto.IWebMessageInfo, companyId: number, wbot: Session) => {
  if (!isValidMsg(message)) {
    return;
  }

  let msgContact: IMe;
  msgContact = await getContactMessage(message, wbot);
  const contact = await verifyContact(msgContact, wbot, companyId);

  const io = getIO();
  const body = await getBodyMessage(message);
  const isCampaign = /\u200c/.test(body);

  if (message.key.fromMe && isCampaign) {
    const messageRecord = await Message.findOne({
      where: {
        [Op.or]: [
          { wid: message.key.id! },
          { contactId: contact.id }
        ],
        companyId
      }
    });

    if (!isNull(messageRecord) || !isNil(messageRecord) || messageRecord !== null) {
      const ticket = await Ticket.findByPk(messageRecord.ticketId);
      await ticket.update({ status: "closed", amountUsedBotQueues: 0, amountUseOutOfHours: 0 });

      io.to("open").emit(`company-${companyId}-ticket`, {
        action: "delete",
        ticket,
        ticketId: ticket.id
      });

      io.to(ticket.status)
        .to(ticket.id.toString())
        .emit(`company-${companyId}-ticket`, {
          action: "update",
          ticket,
          ticketId: ticket.id
        });
    }
  }
};

const filterMessages = (msg: WAMessage): boolean => {

  if (msg.message?.protocolMessage?.editedMessage) return true;

  if (msg.message?.protocolMessage) return false;

  if (
    [
      WAMessageStubType.REVOKE,
      WAMessageStubType.E2E_DEVICE_CHANGED,
      WAMessageStubType.E2E_IDENTITY_CHANGED,
      WAMessageStubType.CIPHERTEXT
    ].includes(msg.messageStubType as typeof WAMessageStubType[keyof typeof WAMessageStubType])
  )
    return false;

  return true;
};

const wbotMessageListener = (wbot: Session, companyId: number): void => {
  wbot.ev.on("messages.upsert", async (messageUpsert: ImessageUpsert) => {

    // Ignorar mensagens do histórico (type='append') para não processar mensagens
    // antigas como novas ao reconectar — principal causa de tickets/mensagens duplicados.
    // type='notify' = mensagem nova em tempo real (única que deve acionar bot/ticket).
    if (messageUpsert.type !== "notify") return;

    const messages = messageUpsert.messages
      .filter(filterMessages)
      .map(msg => msg);



    if (!messages) return;

    for (const message of messages) {
      try {
        const messageExists = await Message.count({
        where: { wid: message.key.id!, companyId }
      });

      if (!messageExists) {
        let isCampaign = false
        let body = await getBodyMessage(message);

        const fromMe = message?.key?.fromMe;

        if (fromMe) {
          isCampaign = /\u200c/.test(body)
        } else {
          if (/\u200c/.test(body))
            body = body.replace(/\u200c/, '')
          logger.debug('Validação de mensagem de campanha enviada por terceiros: ' + body)
        }

        if (!isCampaign) {
          await handleMessage(message, wbot, companyId);
        }

        await verifyRecentCampaign(message, companyId);
        await verifyCampaignMessageAndCloseTicket(message, companyId, wbot);
      }

        if (message.key.remoteJid?.endsWith("@g.us")) {
          handleMsgAck(message as any, 2)
        }
      } catch (err) {
        logger.error({ err }, `[messages.upsert] erro ao processar mensagem ${message.key.id} — continuando loop`);
      }
    }

    // messages.forEach(async (message: proto.IWebMessageInfo) => {
    //   const messageExists = await Message.count({
    //     where: { id: message.key.id!, companyId }
    //   });

    //   if (!messageExists) {
    //     await handleMessage(message, wbot, companyId);
    //     await verifyRecentCampaign(message, companyId);
    //     await verifyCampaignMessageAndCloseTicket(message, companyId);
    //   }
    // });
  });

  wbot.ev.on("messages.update", (messageUpdate: WAMessageUpdate[]) => {


    if (messageUpdate.length === 0) return;
    messageUpdate.forEach(async (message: WAMessageUpdate) => {

      const msgUp = { ...messageUpdate }
      if (msgUp['0']?.update.messageStubType === 1 && msgUp['0']?.key.remoteJid !== 'status@broadcast') {
        MarkDeleteWhatsAppMessage(msgUp['0']?.key.remoteJid, null, msgUp['0']?.key.id, companyId)
      }

      let ack: any;
      if (message.update.status === 3 && message?.key?.fromMe) {
        ack = 2;
      } else {
        ack = message.update.status;
      }

      handleMsgAck(message, ack);
    });
  });

  // wbot.ev.on('message-receipt.update', (events: any) => {
  //   events.forEach(async (msg: any) => {
  //     const ack = msg?.receipt?.receiptTimestamp ? 3 : msg?.receipt?.readTimestamp ? 4 : 0;
  //     if (!ack) return;
  //     await handleMsgAck(msg, ack);
  //   });
  // })

  wbot.ev.on("groups.update", (groupUpdate: GroupMetadata[]) => {
    if (groupUpdate.length === 0) return;
    groupUpdate.forEach(async (group: GroupMetadata) => {
      const number = group.id.replace(/\D/g, "");
      const nameGroup = group.subject || number;

      let profilePicUrl: string;
      try {
        profilePicUrl = await wbot.profilePictureUrl(group.id, "image");
      } catch (e) {
        Sentry.captureException(e);
        profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
      }
      const contactData = {
        name: nameGroup,
        number: number,
        isGroup: true,
        companyId: companyId,
        remoteJid: group.id,
        profilePicUrl
      };

      await CreateOrUpdateContactService(contactData);
    });
  });

  // Quando o bot entrar em um grupo novo ou reconectar e receber lista de grupos
  wbot.ev.on("groups.upsert", async (groupList: GroupMetadata[]) => {
    if (!groupList || groupList.length === 0) return;
    for (const group of groupList) {
      try {
        const number = group.id.replace(/\D/g, "");
        const nameGroup = group.subject || number;

        let profilePicUrl: string;
        try {
          profilePicUrl = await wbot.profilePictureUrl(group.id, "image");
        } catch (e) {
          profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
        }

        await CreateOrUpdateContactService({
          name: nameGroup,
          number,
          isGroup: true,
          companyId,
          remoteJid: group.id,
          profilePicUrl
        });
      } catch (err) {
        Sentry.captureException(err);
      }
    }
  });

};

// adicionado para openai

const sanitizeName = (name: string): string => {
  let sanitized = name.split(" ")[0];
  sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, "");
  return sanitized.substring(0, 60);
};

const transferQueue = async (queueId: number, ticket: Ticket, contact: Contact): Promise<void> => {

  await UpdateTicketService({
    ticketData: { queueId: queueId, useIntegration: false, promptId: null },
    ticketId: ticket.id,
    companyId: ticket.companyId
  });

};

const convertWavToAnotherFormat = (inputPath: string, outputPath: string, toFormat: string) => {




  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputPath)
      .toFormat(toFormat)
      .on("end", () => resolve(outputPath))
      .on("error", (err: { message: any }) =>
        reject(new Error(`Error converting file: ${err.message}`))
      )
      .save(outputPath);
  });
};

const convertTextToSpeechAndSaveToFile = (text: string, filename: string, subscriptionKey: string, serviceRegion: string, voice: string = "pt-BR-FabioNeural", audioToFormat: string = "mp3"): Promise<void> => {

  return new Promise((resolve, reject) => {
    const speechConfig = SpeechConfig.fromSubscription(
      subscriptionKey,
      serviceRegion
    );
    speechConfig.speechSynthesisVoiceName = voice;
    const audioConfig = AudioConfig.fromAudioFileOutput(`${filename}.wav`);
    const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
    synthesizer.speakTextAsync(
      text,
      result => {
        if (result) {
          convertWavToAnotherFormat(
            `${filename}.wav`,
            `${filename}.${audioToFormat}`,
            audioToFormat
          )
            .then(output => {
              resolve();
            })
            .catch(error => {
              console.error(error);
              reject(error);
            });
        } else {
          reject(new Error("No result from synthesizer"));
        }
        synthesizer.close();
      },
      error => {
        console.error(`Error: ${error}`);
        synthesizer.close();
        reject(error);
      }
    );
  });
};

const keepOnlySpecifiedChars = (str: string) => {
  return str.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚâêîôûÂÊÎÔÛãõÃÕçÇ!?.,;:\s]/g, "");
};

const deleteFileSync = (path: string): void => {
  try {
    fs.unlinkSync(path);
  } catch (error) {
    console.error("Erro ao deletar o arquivo:", error);
  }
};


const handleOpenAi = async (msg: proto.IWebMessageInfo, wbot: Session, ticket: Ticket, contact: Contact, mediaSent: Message | undefined, ticketTraking: TicketTraking): Promise<void> => {


  if (contact.disableBot) {
    return;
  }

  const bodyMessage = getBodyMessage(msg);
  if (!bodyMessage) return;

  let { prompt } = await ShowWhatsAppService(wbot.id, ticket.companyId);


  if (!prompt && !isNil(ticket?.queue?.prompt)) {
    prompt = ticket.queue.prompt;
  }

  if (!prompt) return;

  if (msg.messageStubType) return;

  const publicFolder: string = path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    "public",
    `company${ticket.companyId}`
  );

  let openai: OpenAI | any;
  const openAiIndex = sessionsOpenAi.findIndex(s => s.id === ticket.id);

  if (openAiIndex === -1) {

    openai = new OpenAI({ apiKey: prompt.apiKey });
    openai.id = ticket.id;
    sessionsOpenAi.push(openai);
  } else {
    openai = sessionsOpenAi[openAiIndex];
  }

  const messages = await Message.findAll({
    where: { ticketId: ticket.id },
    order: [["createdAt", "ASC"]],
    limit: prompt.maxMessages
  });

  const promptSystem = `Nas respostas utilize o nome ${sanitizeName(contact.name || "Amigo(a)")} para identificar o cliente.\nSua resposta deve usar no máximo ${prompt.maxTokens}
     tokens e cuide para não truncar o final.\nSempre que possível, mencione o nome dele para ser mais personalizado o atendimento e mais educado. Quando a resposta requer uma transferência para o setor de atendimento, comece sua resposta com 'Ação: Transferir para o setor de atendimento'.\n
  ${prompt.prompt}\n`;

  let messagesOpenAi = [];

  if (msg.message?.conversation || msg.message?.extendedTextMessage?.text) {
    messagesOpenAi = [];
    messagesOpenAi.push({ role: "system", content: promptSystem });
    for (
      let i = 0;
      i < Math.min(prompt.maxMessages, messages.length);
      i++
    ) {
      const message = messages[i];
      if (message.mediaType === "chat") {
        if (message.fromMe) {
          messagesOpenAi.push({ role: "assistant", content: message.body });
        } else {
          messagesOpenAi.push({ role: "user", content: message.body });
        }
      }
    }
    messagesOpenAi.push({ role: "user", content: bodyMessage! });

    const chat = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: messagesOpenAi,
      max_tokens: prompt.maxTokens,
      temperature: prompt.temperature
    });

    let response = chat.choices[0].message?.content;

    if (response?.includes("Ação: Transferir para o setor de atendimento")) {
      await transferQueue(prompt.queueId, ticket, contact);
      response = response
        .replace("Ação: Transferir para o setor de atendimento", "")
        .trim();
    }

    if (prompt.voice === "texto") {
      const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, { text: `\u200e ${response!}` });

      // await verifyMessage(sentMessage!, ticket, contact);
      verifyMessage(sentMessage!, ticket, contact, ticketTraking, false, false);
    } else {
      const fileNameWithOutExtension = `${ticket.id}_${Date.now()}`;

      convertTextToSpeechAndSaveToFile(
        keepOnlySpecifiedChars(response!),
        `${publicFolder}/${fileNameWithOutExtension}`,
        prompt.voiceKey,
        prompt.voiceRegion,
        prompt.voice,
        "mp3"
      ).then(async () => {
        try {
          const sendMessage = await wbot.sendMessage(msg.key.remoteJid!, {
            audio: { url: `${publicFolder}/${fileNameWithOutExtension}.mp3` },
            mimetype: "audio/mpeg",
            ptt: true
          });
          await verifyMediaMessage(sendMessage!, ticket, contact, ticketTraking, false);
          deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.mp3`);
          deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.wav`);
        } catch (error) {
          console.log(`Erro para responder com audio: ${error}`);
        }
      });
    }
  } else if (msg.message?.audioMessage) {
    const mediaUrl = mediaSent!.mediaUrl!.split("/").pop();
    const file = fs.createReadStream(`${publicFolder}/${mediaUrl}`) as any;

    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: file,
    });

    messagesOpenAi = [];
    messagesOpenAi.push({ role: "system", content: promptSystem });
    for (
      let i = 0;
      i < Math.min(prompt.maxMessages, messages.length);
      i++
    ) {
      const message = messages[i];
      if (message.mediaType === "chat") {
        if (message.fromMe) {
          messagesOpenAi.push({ role: "assistant", content: message.body });
        } else {
          messagesOpenAi.push({ role: "user", content: message.body });
        }
      }
    }
    messagesOpenAi.push({ role: "user", content: transcription.text });
    const chat = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: messagesOpenAi,
      max_tokens: prompt.maxTokens,
      temperature: prompt.temperature
    });
    let response = chat.choices[0].message?.content;

    if (response?.includes("Ação: Transferir para o setor de atendimento")) {
      await transferQueue(prompt.queueId, ticket, contact);
      response = response
        .replace("Ação: Transferir para o setor de atendimento", "")
        .trim();
    }
    if (prompt.voice === "texto") {
      const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
        text: `\u200e ${response!}`
      });
      // await verifyMessage(sentMessage!, ticket, contact);
      verifyMessage(sentMessage!, ticket, contact, ticketTraking, false, false);
    } else {
      const fileNameWithOutExtension = `${ticket.id}_${Date.now()}`;
      convertTextToSpeechAndSaveToFile(
        keepOnlySpecifiedChars(response!),
        `${publicFolder}/${fileNameWithOutExtension}`,
        prompt.voiceKey,
        prompt.voiceRegion,
        prompt.voice,
        "mp3"
      ).then(async () => {
        try {
          const sendMessage = await wbot.sendMessage(msg.key.remoteJid!, {
            audio: { url: `${publicFolder}/${fileNameWithOutExtension}.mp3` },
            mimetype: "audio/mpeg",
            ptt: true
          });
          await verifyMediaMessage(sendMessage!, ticket, contact, ticketTraking, false);
          deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.mp3`);
          deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.wav`);
        } catch (error) {
          console.log(`Erro para responder com audio: ${error}`);
        }
      });
    }
  }
  messagesOpenAi = [];
};

export { wbotMessageListener, handleMessage, isValidMsg, getTypeMessage };
