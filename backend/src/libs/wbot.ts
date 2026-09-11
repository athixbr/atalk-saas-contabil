import * as Sentry from "@sentry/node";
import makeWASocket, {
  Browsers,
  DisconnectReason,
  WASocket,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  isLidUser,
  isPnUser,
  jidNormalizedUser,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
import { FindOptions } from "sequelize/types";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";
import MAIN_LOGGER from "@whiskeysockets/baileys/lib/Utils/logger";
import { useMultiFileAuthState } from "../helpers/useMultiFileAuthState";
import { Boom } from "@hapi/boom";
import AppError from "../errors/AppError";
import { getIO } from "./socket";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import DeleteBaileysService from "../services/BaileysServices/DeleteBaileysService";
import cacheLayer from "../libs/cache";
import ImportWhatsAppMessageService from "../services/WhatsappService/ImportWhatsAppMessageService";
import { add } from "date-fns";
import moment from "moment";
import { getTypeMessage, isValidMsg } from "../services/WbotServices/wbotMessageListener";
import { addLogs } from "../helpers/addLogs";
import CreateOrUpdateContactService from "../services/ContactServices/CreateOrUpdateContactService";
import NodeCache from 'node-cache';
// @ts-ignore
// @ts-ignore
// @ts-ignore
import { Op } from "sequelize";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import { storeLidMapping } from "./lidCache";

const loggerBaileys = MAIN_LOGGER.child({});
loggerBaileys.level = "error";

type Session = WASocket & {
  id?: number;
};

const sessions: Session[] = [];

const retriesQrCodeMap = new Map<number, number>();

export const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }
  return sessions[sessionIndex];
};

export const restartWbot = async (
  companyId: number,
  session?: any
): Promise<void> => {
  try {
    const options: FindOptions = {
      where: {
        companyId,
      },
      attributes: ["id"],
    }

    const whatsapp = await Whatsapp.findAll(options);

    whatsapp.map(async c => {
      const sessionIndex = sessions.findIndex(s => s.id === c.id);
      if (sessionIndex !== -1) {
        sessions[sessionIndex].ws.close();
      }

    });

  } catch (err) {
    logger.error(err);
  }
};

export const removeWbot = async (
  whatsappId: number,
  isLogout = true
): Promise<void> => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      if (isLogout) {
        sessions[sessionIndex].logout();
        sessions[sessionIndex].ws.close();
      }

      sessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error(err);
  }
};

export var dataMessages: any = {};

export const initWASocket = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise(async (resolve, reject) => {
    try {
      (async () => {
        const io = getIO();

        const whatsappUpdate = await Whatsapp.findOne({
          where: { id: whatsapp.id }
        });

        if (!whatsappUpdate) return;

        const { id, name, provider } = whatsappUpdate;

        const { version, isLatest } = await fetchLatestBaileysVersion();

        logger.info(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
        logger.info(`Starting session ${name}`);
        let retriesQrCode = 0;

        let wsocket: Session = null;

        const { state, saveCreds } = await useMultiFileAuthState(whatsapp);

        const msgRetryCounterCache = new NodeCache();

        // Cache de dispositivos persistido no Redis para evitar delay no primeiro envio após restart.
        // Sem este cache, o primeiro envio a cada contato requer uma consulta usync ao servidor WA
        // que demora 20-60s. Com cache Redis os dispositivos persistem entre restarts.
        const redisDevicesCache = {
          mget: async (users: string[]) => {
            const result: Record<string, any> = {};
            await Promise.all(users.map(async (user) => {
              const cached = await cacheLayer.get(`devicesCache:${whatsapp.id}:${user}`);
              if (cached) {
                try { result[user] = JSON.parse(cached); } catch {}
              }
            }));
            return result;
          },
          mset: async (entries: Array<{key: string, value: any}>) => {
            await Promise.all(entries.map(({ key, value }) =>
              cacheLayer.set(`devicesCache:${whatsapp.id}:${key}`, JSON.stringify(value), 'EX', 86400)
            ));
          },
          get: async (user: string) => {
            const cached = await cacheLayer.get(`devicesCache:${whatsapp.id}:${user}`);
            return cached ? JSON.parse(cached) : undefined;
          },
          set: async (key: string, value: any) => {
            await cacheLayer.set(`devicesCache:${whatsapp.id}:${key}`, JSON.stringify(value), 'EX', 86400);
          }
        };

        wsocket = makeWASocket({
          logger: loggerBaileys,
          printQRInTerminal: false,
          browser: Browsers.appropriate("Desktop"),
          auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
          },
          version,
          defaultQueryTimeoutMs: 10000,
          connectTimeoutMs: 30000,
          keepAliveIntervalMs: 15000,
          retryRequestDelayMs: 250,
          msgRetryCounterCache,
          // @ts-ignore
          userDevicesCache: redisDevicesCache,
          shouldIgnoreJid: jid => isJidBroadcast(jid),
          syncFullHistory: false,
        });



        ////////////////////////////////////////////////////////////////

        setTimeout(async () => {
          const wpp = await Whatsapp.findByPk(whatsapp.id);
          console.log("Status:::::", wpp.status)

          // Determina o intervalo de datas para importação
          const hasManualRange = wpp?.importOldMessages && wpp?.importRecentMessages;
          const dateOldLimit = hasManualRange
            ? new Date(wpp.importOldMessages).getTime()
            : add(new Date(), { days: -90 }).getTime(); // padrão: últimos 90 dias
          const dateRecentLimit = hasManualRange
            ? new Date(wpp.importRecentMessages).getTime()
            : new Date().getTime();

          const statusImportMessages = new Date().getTime();
          await wpp.update({ statusImportMessages });

          // Registra listener de histórico SEMPRE (não só quando importOldMessages está configurado)
          wsocket.ev.on("messaging-history.set", async (messageSet: any) => {
            const whatsappId = whatsapp.id;
            const currentWpp = await Whatsapp.findByPk(whatsappId);

            // Se há range manual configurado, usa ele; caso contrário usa os 90 dias padrão
            const effectiveOldLimit = (currentWpp?.importOldMessages && currentWpp?.importRecentMessages)
              ? new Date(currentWpp.importOldMessages).getTime()
              : add(new Date(), { days: -90 }).getTime();
            const effectiveRecentLimit = (currentWpp?.importOldMessages && currentWpp?.importRecentMessages)
              ? new Date(currentWpp.importRecentMessages).getTime()
              : new Date().getTime();

            await currentWpp.update({ statusImportMessages: new Date().getTime() });

            let filteredDateMessages = [];
            messageSet.messages.forEach(msg => {
              const timestampMsg = Math.floor(msg.messageTimestamp?.["low"] * 1000 || msg.messageTimestamp * 1000);
              if (isValidMsg(msg) && effectiveOldLimit < timestampMsg && effectiveRecentLimit > timestampMsg) {
                if (msg.key?.remoteJid.split("@")[1] !== "g.us") {
                  filteredDateMessages.push(msg);
                } else if (currentWpp?.importOldMessagesGroups) {
                  filteredDateMessages.push(msg);
                }
              }
            });

            if (!dataMessages?.[whatsappId]) {
              dataMessages[whatsappId] = [];
            }
            dataMessages[whatsappId].unshift(...filteredDateMessages);

            io.emit(`importMessages-${currentWpp.companyId}`, {
              action: "update",
              status: { this: -1, all: filteredDateMessages.length }
            });
            io.emit("whatsappSession", { action: "update", session: currentWpp });

            // Aguarda 45s para garantir que todos os batches chegaram antes de importar
            setTimeout(async () => {
              const wppReload = await Whatsapp.findByPk(whatsappId);
              const isRunning = wppReload?.statusImportMessages === "Running";
              if (!isRunning && dataMessages[whatsappId]?.length > 0) {
                await wppReload.update({ statusImportMessages: "Running" });
                ImportWhatsAppMessageService(whatsappId);
              }
              io.emit("whatsappSession", { action: "update", session: wppReload });
            }, 1000 * 45);
          });

        }, 2500);



        ///////////////////////////////////////////////////////////////


        wsocket.ev.on(
          "connection.update",
          async ({ connection, lastDisconnect, qr }) => {
            logger.info(
              `Socket  ${name} Connection Update ${connection || ""} ${lastDisconnect || ""
              }`
            );

            if (connection === "close") {
              if ((lastDisconnect?.error as Boom)?.output?.statusCode === 403) {
                await whatsapp.update({ status: "PENDING", session: "" });
                await DeleteBaileysService(whatsapp.id);
                await cacheLayer.delFromPattern(`sessions:${whatsapp.id}:*`);
                io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
                removeWbot(id, false);
              }
              if (
                (lastDisconnect?.error as Boom)?.output?.statusCode !==
                DisconnectReason.loggedOut
              ) {
                removeWbot(id, false);
                setTimeout(
                  () => StartWhatsAppSession(whatsapp, whatsapp.companyId),
                  2000
                );
              } else {
                await whatsapp.update({ status: "PENDING", session: "" });
                await DeleteBaileysService(whatsapp.id);
                await cacheLayer.delFromPattern(`sessions:${whatsapp.id}:*`);
                io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
                removeWbot(id, false);
                setTimeout(
                  () => StartWhatsAppSession(whatsapp, whatsapp.companyId),
                  2000
                );
              }
            }

            if (connection === "open") {
              await whatsapp.update({
                status: "CONNECTED",
                qrcode: "",
                retries: 0,
                number:
                  wsocket.type === "md"
                    ? jidNormalizedUser((wsocket as WASocket).user.id).split("@")[0]
                    : "-"
              });

              io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                action: "update",
                session: whatsapp
              });

              const sessionIndex = sessions.findIndex(
                s => s.id === whatsapp.id
              );
              if (sessionIndex === -1) {
                wsocket.id = whatsapp.id;
                sessions.push(wsocket);
              }

              resolve(wsocket);

              // Pré-carregar mapeamentos LID→PN do Redis no cache em memória.
              // O evento lid-mapping.update raramente dispara (Baileys issue #2263),
              // então lemos os dados persitidos pelo Baileys na auth store diretamente.
              // Formato no Redis: sessions:{id}:lid-mapping-{lidUser}_reverse → "{pnUser}"
              setTimeout(async () => {
                try {
                  const reverseKeys = await cacheLayer.getKeys(`sessions:${whatsapp.id}:lid-mapping-*_reverse`);
                  if (reverseKeys.length > 0) {
                    logger.info(`[LID] Pré-carregando ${reverseKeys.length} mapeamentos LID do Redis para sessão ${whatsapp.id}`);
                    await Promise.all(reverseKeys.map(async (redisKey) => {
                      try {
                        const raw = await cacheLayer.get(redisKey);
                        if (!raw) return;
                        const pnUser: string = JSON.parse(raw);
                        if (!pnUser || typeof pnUser !== "string") return;
                        // Extrai o lidUser do nome da chave
                        const prefix = `sessions:${whatsapp.id}:lid-mapping-`;
                        const lidUser = redisKey.slice(prefix.length).replace(/_reverse$/, "");
                        if (!lidUser) return;
                        await storeLidMapping(`${lidUser}@lid`, `${pnUser}@s.whatsapp.net`);
                      } catch (e) {
                        logger.warn(`[LID] Erro ao pré-carregar chave ${redisKey}: ${e}`);
                      }
                    }));
                    logger.info(`[LID] Mapeamentos LID pré-carregados para sessão ${whatsapp.id}`);
                  }
                } catch (err) {
                  logger.warn(`[LID] Falha ao pré-carregar mapeamentos LID: ${err}`);
                }
              }, 3000);

              // Carregar todos os grupos que esse número participa
              setTimeout(async () => {
                try {
                  logger.info(`[Groups] Buscando grupos para sessão ${whatsapp.id}...`);
                  const groups = await (wsocket as WASocket).groupFetchAllParticipating();
                  const groupList = Object.values(groups);
                  logger.info(`[Groups] ${groupList.length} grupos encontrados para sessão ${whatsapp.id}`);

                  for (const group of groupList) {
                    try {
                      let profilePicUrl: string;
                      try {
                        profilePicUrl = await wsocket.profilePictureUrl(group.id, "image");
                      } catch {
                        profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
                      }

                      await CreateOrUpdateContactService({
                        name: group.subject || group.id.replace(/\D/g, ""),
                        number: group.id.replace("@g.us", ""),
                        isGroup: true,
                        companyId: whatsapp.companyId,
                        remoteJid: group.id,
                        profilePicUrl
                      });
                    } catch (groupErr) {
                      logger.warn(`[Groups] Erro ao salvar grupo ${group.id}: ${groupErr}`);
                    }
                  }
                  logger.info(`[Groups] Grupos sincronizados para sessão ${whatsapp.id}`);
                } catch (err) {
                  logger.error(`[Groups] Falha ao buscar grupos: ${err}`);
                }
              }, 8000);
            }

            if (qr !== undefined) {
              if (retriesQrCodeMap.get(id) && retriesQrCodeMap.get(id) >= 3) {
                await whatsappUpdate.update({
                  status: "DISCONNECTED",
                  qrcode: ""
                });
                await DeleteBaileysService(whatsappUpdate.id);
                await cacheLayer.delFromPattern(`sessions:${whatsapp.id}:*`);
                io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsappUpdate
                });
                wsocket.ev.removeAllListeners("connection.update");
                wsocket.ws.close();
                wsocket = null;
                retriesQrCodeMap.delete(id);
              } else {
                logger.info(`Session QRCode Generate ${name}`);
                retriesQrCodeMap.set(id, (retriesQrCode += 1));

                await whatsapp.update({
                  qrcode: qr,
                  status: "qrcode",
                  retries: 0,
                  number: ""
                });
                const sessionIndex = sessions.findIndex(
                  s => s.id === whatsapp.id
                );

                if (sessionIndex === -1) {
                  wsocket.id = whatsapp.id;
                  sessions.push(wsocket);
                }

                io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
              }
            }
          }
        );
        wsocket.ev.on("creds.update", saveCreds);

        // Baileys v7: resolver mapeamento LID (→@lid) → phone (→@s.whatsapp.net)
        // O Baileys fornece 3 eventos com essas informações:
        // 1. lid-mapping.update: evento direto { lid, pn } - mais confiável
        // 2. contacts.upsert com id=PN + lid set: phoneNumber=id, lid=lid
        // 3. contacts.upsert com id=LID: não tem phoneNumber ainda (aguarda lid-mapping.update)
        const companyId = whatsapp.companyId;

        // Função central: dado um par { lidJid, phoneJid }, atualiza memória + Redis + banco
        const applyLidMapping = async (lidJid: string, phoneJid: string) => {
          try {
            // 1. In-memory + Redis (via storeLidMapping)
            await storeLidMapping(lidJid, phoneJid);

            const phoneNumber = phoneJid.split("@")[0];

            // Busca contato registrado via @lid no banco
            const lidContact = await Contact.findOne({ where: { remoteJid: lidJid, companyId } });

            // Busca contato registrado via número real
            const phoneContact = await Contact.findOne({
              where: {
                companyId,
                [Op.or]: [{ number: phoneNumber }, { remoteJid: phoneJid }]
              }
            });

            // Helper: buscar foto do contato com timeout
            const fetchProfilePic = async (jid: string): Promise<string | null> => {
              try {
                const picPromise = wsocket.profilePictureUrl(jid, "image");
                const timeout = new Promise<string>((_, rej) => setTimeout(() => rej(new Error("timeout")), 5000));
                const url = await Promise.race([picPromise, timeout]);
                return url || null;
              } catch {
                return null;
              }
            };

            const io = getIO();

            if (lidContact && phoneContact && lidContact.id !== phoneContact.id) {
              // MERGE: dois contatos para a mesma pessoa → fundir no contato real
              await Ticket.update({ contactId: phoneContact.id }, { where: { contactId: lidContact.id } });
              await lidContact.destroy();
              logger.info(`[LID] merge: contato ${lidContact.id} (${lidJid}) → ${phoneContact.id} (${phoneJid})`);

              // Atualiza foto do contato real (CDN URL → download local) se não tiver
              if (!phoneContact.profilePicUrl || phoneContact.profilePicUrl.includes("nopicture")) {
                const picUrl = await fetchProfilePic(phoneJid);
                if (picUrl) {
                  // Usa CreateOrUpdateContactService para baixar e salvar localmente
                  CreateOrUpdateContactService({
                    name: phoneContact.name,
                    number: phoneNumber,
                    isGroup: false,
                    companyId,
                    remoteJid: phoneJid,
                    profilePicUrl: picUrl
                  }).catch(() => {});
                }
              }

              // Deduplicar tickets abertos após o merge.
              const openStatuses = ["open", "pending", "group", "nps", "lgpd"];
              const dupTickets = await Ticket.findAll({
                where: {
                  contactId: phoneContact.id,
                  status: { [Op.in]: openStatuses }
                },
                order: [["id", "ASC"]] // mais antigo primeiro
              });

              // Agrupa por whatsappId
              const byWhatsapp = new Map<number, typeof dupTickets>();
              for (const t of dupTickets) {
                if (!byWhatsapp.has(t.whatsappId)) byWhatsapp.set(t.whatsappId, []);
                byWhatsapp.get(t.whatsappId).push(t);
              }

              for (const [, tickets] of byWhatsapp) {
                if (tickets.length > 1) {
                  // Mantém o mais antigo (index 0), fecha os demais
                  const toClose = tickets.slice(1).map(t => t.id);
                  await Ticket.update({ status: "closed" }, { where: { id: { [Op.in]: toClose } } });
                  logger.info(`[LID] dedup: ${toClose.length} ticket(s) duplicado(s) fechado(s) para contato ${phoneContact.id} (ids: ${toClose.join(",")})`);
                }
              }
            } else if (lidContact && !phoneContact) {
              // Só existe contato LID → atualiza para número/remoteJid real e baixa foto
              const picUrl = (!lidContact.profilePicUrl || lidContact.profilePicUrl.includes("nopicture"))
                ? await fetchProfilePic(phoneJid)
                : null;
              // Usa CreateOrUpdateContactService para download local da foto
              CreateOrUpdateContactService({
                name: lidContact.name || phoneNumber,
                number: phoneNumber,
                isGroup: false,
                companyId,
                remoteJid: phoneJid,
                profilePicUrl: picUrl || lidContact.profilePicUrl || `${process.env.FRONTEND_URL}/nopicture.png`
              }).catch(() => {});
              logger.info(`[LID] resolvido: contato ${lidContact.id} atualizado de ${lidJid} → ${phoneJid}`);
            }
          } catch (e) {
            logger.warn(`[LID] applyLidMapping erro: ${e}`);
          }
        };

        // Evento 1: lid-mapping.update — RARAMENTE dispara na prática (Baileys issue #2263).
        // A resolução principal vem de: remoteJidAlt/participantAlt nas mensagens (wbotMessageListener)
        // e do pré-carregamento Redis acima. Mantemos o listener como fallback residual.
        wsocket.ev.on("lid-mapping.update", async ({ lid, pn }: { lid: string; pn: string }) => {
          if (lid && pn && isLidUser(lid) && isPnUser(pn)) {
            logger.info(`[LID] lid-mapping.update: ${lid} → ${pn}`);
            await applyLidMapping(lid, pn);
          }
        });

        // Evento 2: contacts.upsert — batch de contatos na sincronização inicial
        // Pode conter: (a) id=PN + lid=set → temos o mapeamento, ou (b) id=LID → sem phone ainda
        const handleContactsUpsert = async (contacts: any[]) => {
          // Resumo diagnóstico
          const total = contacts.length;
          const withLid = contacts.filter(c => c.lid || isLidUser(c.id)).length;
          if (total > 0) {
            logger.info(`[LID] contacts.upsert/update: total=${total} com_lid=${withLid}`);
          }

          for (const contact of contacts) {
            try {
              // Caso A: contact.id é PN + contact.lid existe → mapeamento direto
              if (isPnUser(contact.id) && contact.lid && isLidUser(contact.lid)) {
                await applyLidMapping(contact.lid, contact.id);
                continue;
              }

              // Caso B: contact.phoneNumber existe (campo explícito) + algum LID
              const phoneJid = contact.phoneNumber;
              if (phoneJid && isPnUser(phoneJid)) {
                if (contact.lid && isLidUser(contact.lid)) {
                  await applyLidMapping(contact.lid, phoneJid);
                }
                if (isLidUser(contact.id)) {
                  await applyLidMapping(contact.id, phoneJid);
                }
              }
              // Caso C: contact.id é LID sem phone → não tem como resolver agora
              // O lid-mapping.update vai chegar depois com o mapeamento
            } catch (e) {
              // ignore erros individuais
            }
          }
        };

        wsocket.ev.on("contacts.upsert", handleContactsUpsert);
        wsocket.ev.on("contacts.update", handleContactsUpsert);

        wsocket.ev.on(
          "presence.update",
          async ({ id: remoteJid, presences }) => {


            try {
              logger.debug(
                { remoteJid, presences },
                "Received contact presence"
              );
              if (!presences[remoteJid]?.lastKnownPresence) {
                console.debug("Received invalid presence");
                return;
              }
              const contact = await Contact.findOne({
                where: {
                  number: remoteJid.replace(/\D/g, ""),
                  companyId: whatsapp.companyId
                }
              });
              if (!contact) {
                return;
              }



              const ticket = await Ticket.findOne({
                where: {
                  contactId: contact.id,
                  whatsappId: whatsapp.id,
                  status: {
                    [Op.or]: ["open", "pending"]
                  }
                }
              });

              if (ticket) {

                io.to(ticket.id.toString())
                  .to(ticket.status)
                  .emit(`company-${whatsapp.companyId}-presence`, {
                    action: "update-presence",
                    ticketId: ticket.id,
                    presence: presences[remoteJid].lastKnownPresence
                  });

              }
            } catch (error) {
              logger.error(
                { remoteJid, presences },
                "presence.update: error processing"
              );
              if (error instanceof Error) {
                logger.error(`Error: ${error.name} ${error.message}`);
              } else {
                logger.error(`Error was object of type: ${typeof error}`);
              }
            }
          }
        );

      })();
    } catch (error) {
      Sentry.captureException(error);
      console.log(error);
      reject(error);
    }
  });
};
