/**
 * Adapter para WhatsApp-Web.js
 * 
 * IMPORTANTE: Este adapter permite que uma conexão wwebjs
 * herde e reutilize todos os tickets, contatos e mensagens
 * de conexões Baileys existentes, sem necessidade de alteração no banco.
 * 
 * Features:
 * - ✅ Envio/recebimento de mensagens em grupos
 * - ✅ Compatibilidade total com sistema existente
 * - ✅ Usa mesma estrutura de dados do Baileys
 * - ✅ Suporte a mídias
 * - ✅ QR Code
 */

import { Client, LocalAuth, Message, MessageMedia, Chat, Contact as WWebContact } from 'whatsapp-web.js';
import Whatsapp from "../models/Whatsapp";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import { 
  IWhatsAppAdapter, 
  WhatsAppMessage, 
  WhatsAppStatus, 
  SendMessageOptions 
} from "./IWhatsAppAdapter";
import { logger } from "../utils/logger";
import path from "path";
import fs from "fs";
import axios from "axios";

export class WWebJSAdapter implements IWhatsAppAdapter {
  readonly providerName = 'wwebjs';
  
  private client: Client | null = null;
  private whatsapp: Whatsapp;
  private onMessageCallback?: (message: WhatsAppMessage) => void;
  private onStatusChangeCallback?: (status: WhatsAppStatus) => void;
  private isReady = false;
  private currentQR: string | null = null;
  private eventsRegistered = false; // Flag para evitar registro duplicado

  /**
   * Inicializa o cliente WhatsApp Web
   * Usa LocalAuth para manter sessão persistente
   */
  async initialize(whatsapp: Whatsapp): Promise<void> {
    this.whatsapp = whatsapp;
    
    try {
      logger.info(`WWebJSAdapter: Inicializando para whatsapp ${whatsapp.id}`);

      // Configura diretório de autenticação
      const authPath = path.join(__dirname, '..', '..', 'public', '.wwebjs_auth', `session_${whatsapp.id}`);
      
      // Garante que o diretório existe
      if (!fs.existsSync(authPath)) {
        fs.mkdirSync(authPath, { recursive: true });
      }

      // Cria cliente com estratégia de autenticação local
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: `wwebjs_${whatsapp.id}`,
          dataPath: authPath
        }),
        puppeteer: {
          headless: true,
          executablePath: '/usr/bin/chromium-browser', // Usa Chromium do sistema
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
          ],
          timeout: 60000 // 60 segundos de timeout
        },
        // Aumenta timeout para aguardar ready
        authTimeoutMs: 60000
      });

      // ==================
      // EVENT: QR CODE
      // ==================
      this.client.on('qr', (qr: string) => {
        logger.info(`WWebJSAdapter: ========= QR CODE GERADO =========`);
        logger.info(`WWebJSAdapter: WhatsApp ID: ${whatsapp.id}`);
        logger.info(`WWebJSAdapter: QR Length: ${qr?.length || 0}`);
        
        this.currentQR = qr;
        
        if (this.onStatusChangeCallback) {
          logger.info(`WWebJSAdapter: Chamando callback onStatusChange com QR`);
          this.onStatusChangeCallback({
            status: 'QRCODE',
            qrcode: qr
          });
        } else {
          logger.warn(`WWebJSAdapter: onStatusChangeCallback não está registrado!`);
        }
      });

      // ==================
      // EVENT: AUTHENTICATED
      // ==================
      this.client.on('authenticated', () => {
        logger.info(`WWebJSAdapter: ========= AUTENTICADO =========`);
        logger.info(`WWebJSAdapter: WhatsApp ID: ${whatsapp.id}`);
        logger.info(`WWebJSAdapter: Aguardando evento 'ready'...`);
        
        // WORKAROUND 1: Tenta após 1 segundo
        setTimeout(async () => {
          if (!this.isReady && this.client) {
            logger.info(`WWebJSAdapter: [${whatsapp.id}] Verificando status após 1s...`);
            
            try {
              const info = this.client.info as any;
              if (info && info.wid && info.wid.user) {
                logger.info(`WWebJSAdapter: ✓ Conectado! Número: ${info.wid.user}`);
                this.isReady = true;
                
                if (this.onStatusChangeCallback) {
                  this.onStatusChangeCallback({
                    status: 'CONNECTED',
                    number: info.wid.user,
                    battery: info.battery?.toString(),
                    plugged: info.plugged
                  });
                  logger.info(`WWebJSAdapter: Status CONNECTED emitido (1s)`);
                }
              }
            } catch (err) {
              // Silencioso, vai tentar novamente
            }
          }
        }, 1000);
        
        // WORKAROUND 2: Tenta após 3 segundos
        setTimeout(async () => {
          if (!this.isReady && this.client) {
            logger.warn(`WWebJSAdapter: [${whatsapp.id}] Ready não disparou, tentando forçar após 3s...`);
            
            try {
              const info = this.client.info as any;
              if (info && info.wid && info.wid.user) {
                logger.info(`WWebJSAdapter: ✓ Info obtido! Número: ${info.wid.user}`);
                this.isReady = true;
                
                if (this.onStatusChangeCallback) {
                  this.onStatusChangeCallback({
                    status: 'CONNECTED',
                    number: info.wid.user,
                    battery: info.battery?.toString(),
                    plugged: info.plugged
                  });
                  logger.info(`WWebJSAdapter: Status CONNECTED emitido (3s)`);
                }

                // CRÍTICO: Registra eventos de mensagem após conectar
                logger.info(`WWebJSAdapter: [${whatsapp.id}] Registrando eventos de mensagem (workaround 3s)...`);
                this.registerMessageEvents();
                logger.info(`WWebJSAdapter: [${whatsapp.id}] ✓ Eventos registrados com sucesso`);
              } else {
                logger.warn(`WWebJSAdapter: Info ainda não disponível após 3s`);
              }
            } catch (infoError) {
              logger.error(`WWebJSAdapter: Erro ao obter info após 3s:`, infoError);
            }
          }
        }, 3000);
        
        // WORKAROUND 3: Última tentativa após 10 segundos
        setTimeout(async () => {
          if (!this.isReady && this.client) {
            logger.warn(`WWebJSAdapter: [${whatsapp.id}] Última tentativa após 10s...`);
            
            try {
              const info = this.client.info as any;
              if (info && info.wid && info.wid.user) {
                logger.info(`WWebJSAdapter: ✓ Info obtido! Número: ${info.wid.user}`);
                this.isReady = true;
                
                if (this.onStatusChangeCallback) {
                  this.onStatusChangeCallback({
                    status: 'CONNECTED',
                    number: info.wid.user,
                    battery: info.battery?.toString(),
                    plugged: info.plugged
                  });
                  logger.info(`WWebJSAdapter: Status CONNECTED emitido (10s)`);
                }

                // CRÍTICO: Registra eventos de mensagem se ainda não foi feito
                logger.info(`WWebJSAdapter: [${whatsapp.id}] Registrando eventos de mensagem (workaround 10s)...`);
                this.registerMessageEvents();
                logger.info(`WWebJSAdapter: [${whatsapp.id}] ✓ Eventos registrados com sucesso`);
              } else {
                logger.error(`WWebJSAdapter: ✗ Info NÃO disponível após 10s - conexão pode ter falhado`);
                if (this.onStatusChangeCallback) {
                  this.onStatusChangeCallback({
                    status: 'DISCONNECTED'
                  });
                }
              }
            } catch (infoError) {
              logger.error(`WWebJSAdapter: Erro fatal após 10s:`, infoError);
              if (this.onStatusChangeCallback) {
                this.onStatusChangeCallback({
                  status: 'DISCONNECTED'
                });
              }
            }
          }
        }, 10000);
      });

      // ==================
      // EVENT: AUTH FAILURE
      // ==================
      this.client.on('auth_failure', (msg: string) => {
        logger.error(`WWebJSAdapter: ========= FALHA NA AUTENTICAÇÃO =========`);
        logger.error(`WWebJSAdapter: WhatsApp ID: ${whatsapp.id}`);
        logger.error(`WWebJSAdapter: Mensagem:`, msg);
        
        if (this.onStatusChangeCallback) {
          this.onStatusChangeCallback({
            status: 'DISCONNECTED'
          });
        }
      });

      // ==================
      // EVENT: READY
      // ==================
      this.client.on('ready', async () => {
        this.isReady = true;
        logger.info(`WWebJSAdapter: ========= CLIENTE PRONTO =========`);
        logger.info(`WWebJSAdapter: WhatsApp ID: ${whatsapp.id}`);

        try {
          // Obtém informações do número conectado
          const info = this.client!.info as any;
          logger.info(`WWebJSAdapter: Info completo:`, JSON.stringify(info, null, 2));
          
          const number = info.wid.user;
          logger.info(`WWebJSAdapter: Número extraído: ${number}`);
          logger.info(`WWebJSAdapter: Battery: ${info.battery}`);
          logger.info(`WWebJSAdapter: Plugged: ${info.plugged}`);

          if (this.onStatusChangeCallback) {
            logger.info(`WWebJSAdapter: Chamando callback onStatusChange com CONNECTED`);
            this.onStatusChangeCallback({
              status: 'CONNECTED',
              number: number,
              battery: info.battery?.toString(),
              plugged: info.plugged
            });
            logger.info(`WWebJSAdapter: Callback executado`);
          } else {
            logger.warn(`WWebJSAdapter: Callback onStatusChange não está registrado!`);
          }

          // IMPORTANTE: Registrar eventos de mensagem APÓS o cliente estar pronto
          logger.info(`WWebJSAdapter: Registrando eventos de mensagem após ready...`);
          this.registerMessageEvents();
          logger.info(`WWebJSAdapter: Eventos de mensagem registrados com sucesso`);

        } catch (readyError) {
          logger.error(`WWebJSAdapter: Erro ao processar evento ready:`, readyError);
        }
      });

      // ==================
      // EVENT: DISCONNECTED
      // ==================
      this.client.on('disconnected', (reason: string) => {
        logger.warn(`WWebJSAdapter: Desconectado - whatsapp ${whatsapp.id}, motivo:`, reason);
        this.isReady = false;

        if (this.onStatusChangeCallback) {
          this.onStatusChangeCallback({
            status: 'DISCONNECTED'
          });
        }
      });

      // ==================
      // EVENT: LOADING SCREEN
      // ==================
      this.client.on('loading_screen', (percent: number, message: string) => {
        logger.info(`WWebJSAdapter: [${whatsapp.id}] Carregando ${percent}% - ${message}`);
      });

      // ==================
      // EVENT: CHANGE STATE
      // ==================
      this.client.on('change_state', (state: string) => {
        logger.info(`WWebJSAdapter: [${whatsapp.id}] Mudança de estado: ${state}`);
      });

      // ==================
      // EVENT: REMOTE SESSION SAVED
      // ==================
      this.client.on('remote_session_saved', () => {
        logger.info(`WWebJSAdapter: [${whatsapp.id}] Sessão remota salva`);
      });

      // ==================
      // EVENT: MESSAGE_ACK (confirmações de leitura/entrega)
      // ==================
      this.client.on('message_ack', async (msg: Message, ack: any) => {
        try {
          logger.info(`WWebJSAdapter: ========= MESSAGE ACK =========`);
          logger.info(`WWebJSAdapter: Message ID: ${msg.id._serialized}`);
          logger.info(`WWebJSAdapter: ACK: ${ack}`); // 0=erro, 1=pendente, 2=servidor, 3=entregue, 4=lido, 5=jogado
          logger.info(`WWebJSAdapter: From: ${msg.from}`);
          logger.info(`WWebJSAdapter: FromMe: ${msg.fromMe}`);
          
          // TODO: Atualizar ACK da mensagem no banco de dados
          // Você pode adicionar aqui a lógica para atualizar o campo 'ack' da mensagem
          
        } catch (error) {
          logger.error(`WWebJSAdapter: Erro ao processar message_ack:`, error);
        }
      });

      // ==================
      // EVENT: MESSAGE_REACTION (reações a mensagens)
      // ==================
      this.client.on('message_reaction', async (reaction: any) => {
        try {
          logger.info(`WWebJSAdapter: ========= MESSAGE REACTION =========`);
          logger.info(`WWebJSAdapter: Message ID: ${reaction.msgId._serialized}`);
          logger.info(`WWebJSAdapter: Reaction: ${reaction.reaction}`);
          logger.info(`WWebJSAdapter: From: ${reaction.senderId}`);
          
          // Processa reação (você pode salvar no banco se quiser)
          logger.info(`WWebJSAdapter: Reação recebida - Emoji: ${reaction.reaction}`);
        } catch (error) {
          logger.error(`WWebJSAdapter: Erro ao processar message_reaction:`, error);
        }
      });

      // ==================
      // EVENT: MESSAGE_REVOKE_EVERYONE (mensagem deletada para todos)
      // ==================
      this.client.on('message_revoke_everyone', async (after: Message, before: Message | null) => {
        try {
          logger.info(`WWebJSAdapter: ========= MESSAGE REVOKED =========`);
          logger.info(`WWebJSAdapter: Message ID: ${after.id._serialized}`);
          logger.info(`WWebJSAdapter: Body anterior: ${before?.body}`);
          
          // Atualiza mensagem como deletada no banco
          await this.handleIncomingMessage(after);
        } catch (error) {
          logger.error(`WWebJSAdapter: Erro ao processar message_revoke:`, error);
        }
      });

      // ==================
      // EVENT: MESSAGE_REVOKE_ME (mensagem deletada só para mim)
      // ==================
      this.client.on('message_revoke_me', async (msg: Message) => {
        try {
          logger.info(`WWebJSAdapter: ========= MESSAGE REVOKED (ME) =========`);
          logger.info(`WWebJSAdapter: Message ID: ${msg.id._serialized}`);
        } catch (error) {
          logger.error(`WWebJSAdapter: Erro ao processar message_revoke_me:`, error);
        }
      });

      // ==================
      // EVENT: MEDIA_UPLOADED (mídia enviada foi carregada)
      // ==================
      this.client.on('media_uploaded', async (msg: Message) => {
        try {
          logger.info(`WWebJSAdapter: ========= MEDIA UPLOADED =========`);
          logger.info(`WWebJSAdapter: Message ID: ${msg.id._serialized}`);
          logger.info(`WWebJSAdapter: Tipo: ${msg.type}`);
          
          // Processa mídia enviada
          await this.handleIncomingMessage(msg);
        } catch (error) {
          logger.error(`WWebJSAdapter: Erro ao processar media_uploaded:`, error);
        }
      });

      // ==================
      // EVENT: GROUP_JOIN (alguém entrou no grupo)
      // ==================
      this.client.on('group_join', async (notification: any) => {
        try {
          logger.info(`WWebJSAdapter: ========= GROUP JOIN =========`);
          logger.info(`WWebJSAdapter: Group ID: ${notification.chatId}`);
          logger.info(`WWebJSAdapter: Participante: ${notification.recipientIds}`);
        } catch (error) {
          logger.error(`WWebJSAdapter: Erro ao processar group_join:`, error);
        }
      });

      // ==================
      // EVENT: GROUP_LEAVE (alguém saiu do grupo)
      // ==================
      this.client.on('group_leave', async (notification: any) => {
        try {
          logger.info(`WWebJSAdapter: ========= GROUP LEAVE =========`);
          logger.info(`WWebJSAdapter: Group ID: ${notification.chatId}`);
          logger.info(`WWebJSAdapter: Participante: ${notification.recipientIds}`);
        } catch (error) {
          logger.error(`WWebJSAdapter: Erro ao processar group_leave:`, error);
        }
      });

      // ==================
      // EVENT: GROUP_UPDATE (informações do grupo mudaram)
      // ==================
      this.client.on('group_update', async (notification: any) => {
        try {
          logger.info(`WWebJSAdapter: ========= GROUP UPDATE =========`);
          logger.info(`WWebJSAdapter: Group ID: ${notification.chatId}`);
          logger.info(`WWebJSAdapter: Tipo: ${notification.type}`);
        } catch (error) {
          logger.error(`WWebJSAdapter: Erro ao processar group_update:`, error);
        }
      });

      // ==================
      // EVENT: CONTACT_CHANGED (contato mudou perfil/nome/foto)
      // ==================
      this.client.on('contact_changed', async (message: any, oldId: string, newId: string, isContact: boolean) => {
        try {
          logger.info(`WWebJSAdapter: ========= CONTACT CHANGED =========`);
          logger.info(`WWebJSAdapter: Old ID: ${oldId}`);
          logger.info(`WWebJSAdapter: New ID: ${newId}`);
          logger.info(`WWebJSAdapter: Is Contact: ${isContact}`);
        } catch (error) {
          logger.error(`WWebJSAdapter: Erro ao processar contact_changed:`, error);
        }
      });

      // Inicializa o cliente
      logger.info(`WWebJSAdapter: Iniciando cliente para whatsapp ${whatsapp.id}...`);
      
      try {
        await this.client.initialize();
        logger.info(`WWebJSAdapter: Inicialização completa para whatsapp ${whatsapp.id}`);

        // BACKUP: Tenta registrar eventos após 5 segundos (caso ready/authenticated não disparem)
        setTimeout(() => {
          if (!this.eventsRegistered && this.client) {
            logger.warn(`WWebJSAdapter: [${whatsapp.id}] BACKUP: Registrando eventos após 5s...`);
            try {
              this.registerMessageEvents();
              logger.info(`WWebJSAdapter: [${whatsapp.id}] ✓ Eventos registrados via BACKUP`);
            } catch (err) {
              logger.error(`WWebJSAdapter: Erro ao registrar eventos (backup):`, err);
            }
          } else {
            logger.info(`WWebJSAdapter: [${whatsapp.id}] Eventos já registrados, backup ignorado`);
          }
        }, 5000);

      } catch (initError) {
        logger.error(`WWebJSAdapter: ERRO na inicialização do cliente:`, initError);
        throw initError;
      }

    } catch (error) {
      logger.error(`WWebJSAdapter: Erro ao inicializar:`, error);
      throw error;
    }
  }

  /**
   * Registra eventos de mensagem APÓS o cliente estar pronto
   * CRÍTICO: Eventos devem ser registrados depois do 'ready' no WWebJS
   */
  private registerMessageEvents(): void {
    if (!this.client) {
      logger.error(`WWebJSAdapter: Cliente não inicializado ao registrar eventos`);
      return;
    }

    // Evita registro duplicado
    if (this.eventsRegistered) {
      logger.warn(`WWebJSAdapter: Eventos já registrados, ignorando chamada duplicada`);
      return;
    }

    logger.info(`WWebJSAdapter: ========= REGISTRANDO EVENTOS DE MENSAGEM =========`);
    logger.info(`WWebJSAdapter: WhatsApp ID: ${this.whatsapp.id}`);
    logger.info(`WWebJSAdapter: Cliente ready: ${this.isReady}`);
    logger.info(`WWebJSAdapter: Cliente existe: ${!!this.client}`);

    // ==================
    // EVENT: MESSAGE (apenas mensagens recebidas)
    // ==================
    this.client.on('message', async (msg: Message) => {
      try {
        logger.info(`WWebJSAdapter: ========= EVENTO MESSAGE =========`);
        logger.info(`WWebJSAdapter: WhatsApp ID: ${this.whatsapp.id}`);
        logger.info(`WWebJSAdapter: De: ${msg.from}`);
        logger.info(`WWebJSAdapter: Para: ${msg.to}`);
        logger.info(`WWebJSAdapter: FromMe: ${msg.fromMe}`);
        logger.info(`WWebJSAdapter: Tipo: ${msg.type}`);
        logger.info(`WWebJSAdapter: Body: ${msg.body?.substring(0, 100)}`);
        logger.info(`WWebJSAdapter: Timestamp: ${msg.timestamp}`);
        logger.info(`WWebJSAdapter: ID: ${msg.id._serialized}`);
        
        // Não processa mensagens próprias no evento 'message' (só no message_create)
        if (!msg.fromMe) {
          logger.info(`WWebJSAdapter: Mensagem de cliente - processando...`);
          await this.handleIncomingMessage(msg);
        } else {
          logger.info(`WWebJSAdapter: Mensagem própria - ignorando (será processada em message_create)`);
        }
      } catch (error) {
        logger.error(`WWebJSAdapter: Erro ao processar mensagem:`, error);
      }
    });

    // ==================
    // EVENT: MESSAGE_CREATE (todas as mensagens, incluindo enviadas)
    // ==================
    this.client.on('message_create', async (msg: Message) => {
      try {
        logger.info(`WWebJSAdapter: ========= EVENTO MESSAGE_CREATE =========`);
        logger.info(`WWebJSAdapter: WhatsApp ID: ${this.whatsapp.id}`);
        logger.info(`WWebJSAdapter: De: ${msg.from}`);
        logger.info(`WWebJSAdapter: Para: ${msg.to}`);
        logger.info(`WWebJSAdapter: FromMe: ${msg.fromMe}`);
        logger.info(`WWebJSAdapter: Tipo: ${msg.type}`);
        logger.info(`WWebJSAdapter: Body: ${msg.body?.substring(0, 100)}`);
        
        // Processa TODAS as mensagens
        logger.info(`WWebJSAdapter: Processando mensagem (create)...`);
        await this.handleIncomingMessage(msg);
      } catch (error) {
        logger.error(`WWebJSAdapter: Erro ao processar message_create:`, error);
      }
    });

    this.eventsRegistered = true;
    logger.info(`WWebJSAdapter: ✓ Eventos 'message' e 'message_create' registrados com sucesso`);
  }

  /**
   * Processa mensagens recebidas e converte para formato padrão
   * IMPORTANTE: Mantém compatibilidade com estrutura Baileys para herdar tickets
   */
  private async handleIncomingMessage(msg: Message): Promise<void> {
    try {
      logger.info(`WWebJSAdapter: ========= HANDLE INCOMING MESSAGE =========`);
      logger.info(`WWebJSAdapter: Message ID: ${msg.id._serialized}`);
      logger.info(`WWebJSAdapter: From: ${msg.from}`);
      logger.info(`WWebJSAdapter: To: ${msg.to}`);
      logger.info(`WWebJSAdapter: FromMe: ${msg.fromMe}`);
      logger.info(`WWebJSAdapter: Body: ${msg.body?.substring(0, 100)}`);
      logger.info(`WWebJSAdapter: Type: ${msg.type}`);
      logger.info(`WWebJSAdapter: HasMedia: ${msg.hasMedia}`);
      
      const chat = await msg.getChat();
      const contact = await msg.getContact();
      
      logger.info(`WWebJSAdapter: Chat ID: ${chat.id._serialized}`);
      logger.info(`WWebJSAdapter: Chat Name: ${chat.name}`);
      logger.info(`WWebJSAdapter: Chat IsGroup: ${chat.isGroup}`);
      logger.info(`WWebJSAdapter: Contact ID: ${contact.id._serialized}`);
      logger.info(`WWebJSAdapter: Contact Name: ${contact.name || contact.pushname}`);

      // Determina se é grupo
      const isGroup = chat.isGroup;
      const chatId = msg.from;
      
      // Para grupos, o participant é quem enviou
      const participant = isGroup ? msg.author : undefined;

      // Converte para formato padrão (compatível com Baileys)
      const whatsappMessage: WhatsAppMessage = {
        id: msg.id._serialized,
        from: chatId,
        fromMe: msg.fromMe,
        to: msg.to || '',
        body: msg.body,
        timestamp: msg.timestamp,
        type: this.getMessageType(msg),
        isGroup: isGroup,
        participant: participant,
        quotedMsg: msg.hasQuotedMsg ? await msg.getQuotedMessage() : undefined
      };

      // Se tem mídia, baixa e adiciona URL
      if (msg.hasMedia) {
        try {
          const media = await msg.downloadMedia();
          if (media) {
            // Salva mídia e obtém URL local
            whatsappMessage.mediaUrl = await this.saveMedia(media, msg);
            whatsappMessage.caption = msg.body || media.filename || '';
          }
        } catch (error) {
          logger.error(`WWebJSAdapter: Erro ao baixar mídia:`, error);
        }
      }

      logger.info(`WWebJSAdapter: Mensagem recebida de ${chatId} (grupo: ${isGroup}, fromMe: ${msg.fromMe})`);

      // Envia para o sistema via callback
      if (this.onMessageCallback) {
        logger.info(`WWebJSAdapter: Chamando callback onMessage para processar mensagem`);
        this.onMessageCallback(whatsappMessage);
        logger.info(`WWebJSAdapter: Callback onMessage executado com sucesso`);
      } else {
        logger.error(`WWebJSAdapter: CALLBACK onMessage NÃO ESTÁ REGISTRADO!`);
      }

    } catch (error) {
      logger.error(`WWebJSAdapter: Erro ao processar mensagem recebida:`, error);
    }
  }

  /**
   * Determina o tipo da mensagem
   */
  private getMessageType(msg: Message): WhatsAppMessage['type'] {
    if (msg.hasMedia) {
      if (msg.type === 'image') return 'image';
      if (msg.type === 'video') return 'video';
      if (msg.type === 'audio' || msg.type === 'ptt') return 'audio';
      if (msg.type === 'document') return 'document';
      if (msg.type === 'sticker') return 'sticker';
    }
    if (msg.type === 'location') return 'location';
    if (msg.type === 'vcard') return 'contact';
    return 'text';
  }

  /**
   * Salva mídia no diretório público e retorna URL
   */
  private async saveMedia(media: MessageMedia, msg: Message): Promise<string> {
    const companyId = this.whatsapp.companyId;
    const mediaDir = path.join(
      __dirname, 
      '..', 
      '..', 
      'public', 
      `company${companyId}`
    );

    // Garante que o diretório existe
    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir, { recursive: true });
    }

    // Gera nome do arquivo
    const extension = media.mimetype?.split('/')[1] || 'bin';
    const filename = `${Date.now()}_${msg.id._serialized}.${extension}`;
    const filepath = path.join(mediaDir, filename);

    // Salva arquivo
    const buffer = Buffer.from(media.data, 'base64');
    fs.writeFileSync(filepath, buffer as any);

    // Retorna URL relativa
    return `/public/company${companyId}/${filename}`;
  }

  /**
   * Garante que o cliente está pronto para uso
   */
  private async waitForReady(maxWaitMs: number = 30000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitMs) {
      try {
        // Tenta buscar info do cliente
        const info = await this.client.info;
        if (info && info.wid) {
          logger.info(`WWebJSAdapter: Cliente pronto! WID: ${info.wid._serialized}`);
          return true;
        }
      } catch (error) {
        // Ignora erro e tenta novamente
      }
      
      // Aguarda 500ms antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    logger.warn(`WWebJSAdapter: Timeout aguardando cliente ficar pronto`);
    return false;
  }

  /**
   * Garante que o chat existe e está carregado
   */
  private async ensureChatExists(chatId: string): Promise<boolean> {
    try {
      // Tenta obter o chat
      const chat = await this.client.getChatById(chatId);
      return !!chat;
    } catch (error) {
      logger.warn(`WWebJSAdapter: Chat ${chatId} não encontrado, será criado ao enviar mensagem`);
      return false;
    }
  }

  /**
   * Envia mensagem de texto
   * IMPORTANTE: Funciona em conversas individuais E em grupos
   */
  async sendMessage(
    to: string,
    message: string,
    ticket: Ticket,
    options?: SendMessageOptions
  ): Promise<any> {
    try {
      if (!this.client) {
        throw new Error('Cliente WWebJS não foi inicializado');
      }

      // Aguarda o cliente estar realmente pronto
      const isReady = await this.waitForReady(10000);
      if (!isReady) {
        throw new Error('Cliente WWebJS não está pronto para enviar mensagens');
      }

      // Formata número/grupo corretamente
      const chatId = this.formatChatId(to);

      logger.info(`WWebJSAdapter: Enviando mensagem para ${chatId}`);

      // Prepara opções de envio
      const sendOptions: any = {};

      // Se tem mensagem citada
      if (options?.quotedMsg) {
        sendOptions.quotedMessageId = options.quotedMsg.id?._serialized || options.quotedMsg.id;
      }

      // Se tem menções
      if (options?.mentionedJidList && options.mentionedJidList.length > 0) {
        sendOptions.mentions = options.mentionedJidList;
      }

      // Tenta criar/carregar o chat ANTES de enviar
      try {
        logger.info(`WWebJSAdapter: Carregando chat ${chatId}...`);
        const chat = await this.client.getChatById(chatId);
        logger.info(`WWebJSAdapter: Chat carregado: ${chat ? 'OK' : 'FALHOU'}`);
      } catch (chatError) {
        logger.warn(`WWebJSAdapter: Não foi possível carregar chat, mas continuará tentando enviar`);
      }

      // Desabilita sendSeen via Puppeteer e envia
      logger.info(`WWebJSAdapter: Tentando enviar mensagem...`);
      
      try {
        // SOLUÇÃO: whatsapp-web.js tem a opção sendSeen que pode ser false!
        // Passa sendSeen: false para não marcar como lido automaticamente
        const sendMessageOptions = {
          ...sendOptions,
          sendSeen: false  // NÃO marcar como lido ao enviar
        };
        
        logger.info(`WWebJSAdapter: Enviando mensagem com sendSeen=false...`);
        
        // Envia mensagem SEM marcar como lido
        const sentMessage = await this.client.sendMessage(chatId, message, sendMessageOptions);
        
        logger.info(`WWebJSAdapter: ✓ Mensagem enviada com sucesso!`);
        
        return {
          id: sentMessage.id._serialized || sentMessage.id,
          timestamp: sentMessage.timestamp,
          from: sentMessage.from || chatId,
          to: sentMessage.to || chatId,
          body: message,
          ack: sentMessage.ack || 1
        };
        
      } catch (error: any) {
        logger.error(`WWebJSAdapter: Erro ao enviar:`, error.message);
        throw error;
      }

    } catch (error) {
      logger.error(`WWebJSAdapter: Erro ao enviar mensagem:`, error);
      throw error;
    }
  }

  /**
   * Envia mídia (imagem, vídeo, áudio, documento)
   * IMPORTANTE: Funciona em conversas individuais E em grupos
   */
  async sendMedia(
    to: string,
    media: {
      type: 'image' | 'video' | 'audio' | 'document';
      url?: string;
      buffer?: Buffer;
      filename?: string;
      caption?: string;
      mimetype?: string;
    },
    ticket: Ticket
  ): Promise<any> {
    try {
      if (!this.client || !this.isReady) {
        throw new Error('Cliente não está pronto');
      }

      const chatId = this.formatChatId(to);

      logger.info(`WWebJSAdapter: Enviando ${media.type} para ${chatId}`);

      let messageMedia: MessageMedia;

      // Se tem URL, faz download
      if (media.url) {
        const response = await axios.get(media.url, {
          responseType: 'arraybuffer'
        });
        const buffer = Buffer.from(response.data);
        const base64 = buffer.toString('base64');

        messageMedia = new MessageMedia(
          media.mimetype || this.getMimeType(media.type),
          base64,
          media.filename || `file.${this.getExtension(media.type)}`
        );
      } 
      // Se tem buffer
      else if (media.buffer) {
        const base64 = media.buffer.toString('base64');
        messageMedia = new MessageMedia(
          media.mimetype || this.getMimeType(media.type),
          base64,
          media.filename || `file.${this.getExtension(media.type)}`
        );
      } else {
        throw new Error('Mídia deve ter url ou buffer');
      }

      // Envia com ou sem legenda
      const sentMessage = await this.client.sendMessage(chatId, messageMedia, {
        caption: media.caption
      });

      logger.info(`WWebJSAdapter: Mídia enviada com sucesso para ${chatId}`);

      return {
        id: sentMessage.id._serialized,
        timestamp: sentMessage.timestamp,
        from: sentMessage.from,
        to: sentMessage.to
      };

    } catch (error) {
      logger.error(`WWebJSAdapter: Erro ao enviar mídia:`, error);
      throw error;
    }
  }

  /**
   * Formata chatId para formato wwebjs
   * Mantém compatibilidade com IDs do Baileys
   */
  private formatChatId(jid: string): string {
    // Se já está no formato correto, retorna
    if (jid.includes('@')) {
      return jid;
    }

    // Se é número puro, adiciona sufixo
    // Grupos: @g.us
    // Individuais: @c.us
    return `${jid}@c.us`;
  }

  /**
   * Obtém mimetype padrão por tipo
   */
  private getMimeType(type: string): string {
    const mimeTypes: Record<string, string> = {
      image: 'image/jpeg',
      video: 'video/mp4',
      audio: 'audio/ogg; codecs=opus',
      document: 'application/pdf'
    };
    return mimeTypes[type] || 'application/octet-stream';
  }

  /**
   * Obtém extensão por tipo
   */
  private getExtension(type: string): string {
    const extensions: Record<string, string> = {
      image: 'jpg',
      video: 'mp4',
      audio: 'ogg',
      document: 'pdf'
    };
    return extensions[type] || 'bin';
  }

  /**
   * Desconecta o cliente
   */
  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        logger.info(`WWebJSAdapter: Desconectando whatsapp ${this.whatsapp.id}`);
        await this.client.destroy();
        this.client = null;
        this.isReady = false;
      }
    } catch (error) {
      logger.error(`WWebJSAdapter: Erro ao desconectar:`, error);
      throw error;
    }
  }

  /**
   * Obtém QR Code atual
   */
  async getQRCode(): Promise<string | null> {
    return this.currentQR;
  }

  /**
   * Obtém status da conexão
   */
  async getStatus(): Promise<WhatsAppStatus> {
    if (!this.client) {
      return { status: 'DISCONNECTED' };
    }

    if (!this.isReady) {
      if (this.currentQR) {
        return { status: 'QRCODE', qrcode: this.currentQR };
      }
      return { status: 'OPENING' };
    }

    const info = this.client.info as any;
    return {
      status: 'CONNECTED',
      number: info?.wid?.user,
      battery: info?.battery?.toString(),
      plugged: info?.plugged
    };
  }

  /**
   * Registra callback para mensagens
   */
  onMessage(callback: (message: WhatsAppMessage) => void): void {
    const whatsappId = this.whatsapp?.id || 'unknown';
    logger.info(`WWebJSAdapter: Registrando callback onMessage para whatsapp ${whatsappId}`);
    this.onMessageCallback = callback;
    logger.info(`WWebJSAdapter: Callback onMessage registrado com sucesso`);
  }

  /**
   * Registra callback para status
   */
  onStatusChange(callback: (status: WhatsAppStatus) => void): void {
    const whatsappId = this.whatsapp?.id || 'unknown';
    logger.info(`WWebJSAdapter: Registrando callback onStatusChange para whatsapp ${whatsappId}`);
    this.onStatusChangeCallback = callback;
    logger.info(`WWebJSAdapter: Callback onStatusChange registrado com sucesso`);
  }

  /**
   * Verifica se número existe no WhatsApp
   */
  async checkNumber(number: string): Promise<{ exists: boolean; jid?: string }> {
    try {
      if (!this.client || !this.isReady) {
        throw new Error('Cliente não está pronto');
      }

      const numberId = await this.client.getNumberId(number);
      
      if (numberId) {
        return {
          exists: true,
          jid: numberId._serialized
        };
      }

      return { exists: false };

    } catch (error) {
      logger.error(`WWebJSAdapter: Erro ao verificar número:`, error);
      return { exists: false };
    }
  }

  /**
   * Obtém foto de perfil
   */
  async getProfilePicture(jid: string): Promise<string | null> {
    try {
      if (!this.client || !this.isReady) {
        return null;
      }

      const chatId = this.formatChatId(jid);
      const profilePicUrl = await this.client.getProfilePicUrl(chatId);
      
      return profilePicUrl || null;

    } catch (error) {
      logger.error(`WWebJSAdapter: Erro ao obter foto de perfil:`, error);
      return null;
    }
  }

  /**
   * Marca mensagem como lida
   */
  async markMessageAsRead(messageId: string, remoteJid: string): Promise<void> {
    try {
      if (!this.client || !this.isReady) {
        return;
      }

      const chatId = this.formatChatId(remoteJid);
      const chat = await this.client.getChatById(chatId);
      
      // Valida se o chat foi encontrado
      if (!chat) {
        logger.debug(`WWebJSAdapter: Chat ${chatId} não encontrado para marcar como lido`);
        return;
      }

      // Marca o chat inteiro como lido
      await chat.sendSeen();

    } catch (error) {
      // Não loga erro completo pois não é crítico
      logger.debug(`WWebJSAdapter: Não foi possível marcar como lido: ${error.message}`);
    }
  }

  /**
   * Envia presença (digitando, gravando áudio, etc)
   */
  async sendPresence(to: string, type: 'composing' | 'recording' | 'available'): Promise<void> {
    try {
      if (!this.client || !this.isReady) {
        return;
      }

      const chatId = this.formatChatId(to);
      const chat = await this.client.getChatById(chatId);

      if (type === 'composing') {
        await chat.sendStateTyping();
      } else if (type === 'recording') {
        await chat.sendStateRecording();
      } else {
        await chat.clearState();
      }

    } catch (error) {
      logger.error(`WWebJSAdapter: Erro ao enviar presença:`, error);
    }
  }

  /**
   * Obtém informações de contato
   */
  async getContact(jid: string): Promise<{
    name?: string;
    pushName?: string;
    profilePic?: string;
  }> {
    try {
      if (!this.client || !this.isReady) {
        return {};
      }

      const contactId = this.formatChatId(jid);
      const contact = await this.client.getContactById(contactId);

      return {
        name: contact.name,
        pushName: contact.pushname,
        profilePic: await this.getProfilePicture(jid)
      };

    } catch (error) {
      logger.error(`WWebJSAdapter: Erro ao obter contato:`, error);
      return {};
    }
  }

  /**
   * Obtém informações de grupo
   * IMPORTANTE: Essencial para funcionar resposta em grupos
   */
  async getGroupInfo(groupJid: string): Promise<{
    subject: string;
    participants: Array<{ id: string; isAdmin: boolean }>;
    owner?: string;
    creation?: number;
  }> {
    try {
      if (!this.client || !this.isReady) {
        throw new Error('Cliente não está pronto');
      }

      const chatId = this.formatChatId(groupJid);
      const chat = await this.client.getChatById(chatId) as any;

      if (!chat.isGroup) {
        throw new Error('Chat não é um grupo');
      }

      // Obtém participantes
      const participants = chat.participants.map((p: any) => ({
        id: p.id._serialized,
        isAdmin: p.isAdmin || p.isSuperAdmin
      }));

      return {
        subject: chat.name,
        participants: participants,
        owner: chat.owner?._serialized,
        creation: chat.createdAt ? chat.createdAt.valueOf() : undefined
      };

    } catch (error) {
      logger.error(`WWebJSAdapter: Erro ao obter info do grupo:`, error);
      throw error;
    }
  }

  /**
   * Obtém todos os contatos (para importação)
   */
  async getAllContacts(): Promise<Array<{
    id: string;
    name?: string;
    pushname?: string;
    profilePicUrl?: string;
    isGroup: boolean;
  }>> {
    try {
      if (!this.client || !this.isReady) {
        throw new Error('Cliente não está pronto');
      }

      logger.info(`WWebJSAdapter: Obtendo todos os contatos...`);

      const contacts = await this.client.getContacts();
      
      const result = await Promise.all(
        contacts.map(async (contact) => {
          try {
            // Tenta obter foto de perfil
            let profilePicUrl;
            try {
              profilePicUrl = await this.client!.getProfilePicUrl(contact.id._serialized);
            } catch (e) {
              // Sem foto
            }

            return {
              id: contact.id._serialized,
              name: contact.name,
              pushname: contact.pushname,
              profilePicUrl,
              isGroup: contact.isGroup
            };
          } catch (error) {
            logger.error(`WWebJSAdapter: Erro ao processar contato ${contact.id._serialized}:`, error);
            return {
              id: contact.id._serialized,
              name: contact.name,
              pushname: contact.pushname,
              isGroup: contact.isGroup
            };
          }
        })
      );

      logger.info(`WWebJSAdapter: ${result.length} contatos obtidos`);
      return result;

    } catch (error) {
      logger.error(`WWebJSAdapter: Erro ao obter contatos:`, error);
      throw error;
    }
  }

  /**
   * Obtém todos os chats (para importação de histórico)
   */
  async getAllChats(): Promise<Array<{
    id: string;
    name: string;
    isGroup: boolean;
    unreadCount: number;
    lastMessage?: {
      body: string;
      timestamp: number;
      fromMe: boolean;
    };
  }>> {
    try {
      if (!this.client || !this.isReady) {
        throw new Error('Cliente não está pronto');
      }

      logger.info(`WWebJSAdapter: Obtendo todos os chats...`);

      const chats = await this.client.getChats();
      
      const result = chats.map((chat: any) => ({
        id: chat.id._serialized,
        name: chat.name,
        isGroup: chat.isGroup,
        unreadCount: chat.unreadCount || 0,
        lastMessage: chat.lastMessage ? {
          body: chat.lastMessage.body,
          timestamp: chat.lastMessage.timestamp,
          fromMe: chat.lastMessage.fromMe
        } : undefined
      }));

      logger.info(`WWebJSAdapter: ${result.length} chats obtidos`);
      return result;

    } catch (error) {
      logger.error(`WWebJSAdapter: Erro ao obter chats:`, error);
      throw error;
    }
  }

  /**
   * Obtém mensagens de um chat (para importação de histórico)
   */
  async getChatMessages(chatId: string, limit: number = 100): Promise<any[]> {
    try {
      if (!this.client || !this.isReady) {
        throw new Error('Cliente não está pronto');
      }

      const formattedChatId = this.formatChatId(chatId);
      const chat = await this.client.getChatById(formattedChatId);
      
      // Busca mensagens
      const messages = await chat.fetchMessages({ limit });

      logger.info(`WWebJSAdapter: ${messages.length} mensagens obtidas de ${chatId}`);
      
      return messages;

    } catch (error) {
      logger.error(`WWebJSAdapter: Erro ao obter mensagens do chat:`, error);
      throw error;
    }
  }
}

