/**
 * Adapter para Evolution API
 * https://doc.evolution-api.com/
 * 
 * Evolution API é uma REST API baseada no Baileys mais recente (ESM)
 * Resolve os problemas de mensagens, grupos e contatos duplicados
 */

import axios, { AxiosInstance } from 'axios';
import Whatsapp from "../models/Whatsapp";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import { IWhatsAppAdapter, WhatsAppMessage, WhatsAppStatus, SendMessageOptions } from "./IWhatsAppAdapter";
import { logger } from "../utils/logger";

export class EvolutionAdapter implements IWhatsAppAdapter {
  readonly providerName = 'evolution';
  
  private api: AxiosInstance;
  private instanceName: string;
  private whatsapp: Whatsapp;
  private messageCallback?: (message: WhatsAppMessage) => void;
  private statusCallback?: (status: WhatsAppStatus) => void;

  constructor(apiUrl: string, apiKey: string) {
    this.api = axios.create({
      baseURL: apiUrl,
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  async initialize(whatsapp: Whatsapp): Promise<void> {
    this.whatsapp = whatsapp;
    this.instanceName = `instance_${whatsapp.id}`;

    try {
      // Verifica se instância já existe
      const instances = await this.api.get('/instance/fetchInstances');
      const exists = instances.data.some((i: any) => i.instance.instanceName === this.instanceName);

      if (!exists) {
        // Cria nova instância
        await this.api.post('/instance/create', {
          instanceName: this.instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
          webhook: {
            url: `${process.env.BACKEND_URL}/api/webhooks/evolution/${whatsapp.id}`,
            webhook_by_events: true,
            webhook_base64: false,
            events: [
              'QRCODE_UPDATED',
              'MESSAGES_UPSERT',
              'MESSAGES_UPDATE',
              'CONNECTION_UPDATE',
              'CONTACTS_UPDATE'
            ]
          }
        });
        
        logger.info(`Evolution: Instância ${this.instanceName} criada`);
      }

      // Conecta instância
      await this.api.post(`/instance/connect/${this.instanceName}`);
      logger.info(`Evolution: Instância ${this.instanceName} conectando...`);

    } catch (error) {
      logger.error(`Evolution: Erro ao inicializar ${this.instanceName}:`, error);
      throw error;
    }
  }

  async sendMessage(
    to: string,
    message: string,
    ticket: Ticket,
    options?: SendMessageOptions
  ): Promise<any> {
    try {
      const number = to.includes('@') ? to : `${to}@s.whatsapp.net`;
      
      const payload: any = {
        number: number.replace('@s.whatsapp.net', '').replace('@g.us', ''),
        text: message,
      };

      if (options?.quotedMsg) {
        payload.quoted = {
          key: options.quotedMsg.key,
          message: options.quotedMsg.message
        };
      }

      const response = await this.api.post(
        `/message/sendText/${this.instanceName}`,
        payload
      );

      logger.info(`Evolution: Mensagem enviada para ${to}`);
      return response.data;

    } catch (error) {
      logger.error(`Evolution: Erro ao enviar mensagem:`, error);
      throw error;
    }
  }

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
      const number = to.includes('@') ? to : `${to}@s.whatsapp.net`;
      
      let endpoint = '';
      let payload: any = {
        number: number.replace('@s.whatsapp.net', '').replace('@g.us', ''),
      };

      switch (media.type) {
        case 'image':
          endpoint = `/message/sendMedia/${this.instanceName}`;
          payload.mediatype = 'image';
          payload.media = media.url;
          payload.caption = media.caption || '';
          break;

        case 'video':
          endpoint = `/message/sendMedia/${this.instanceName}`;
          payload.mediatype = 'video';
          payload.media = media.url;
          payload.caption = media.caption || '';
          break;

        case 'audio':
          endpoint = `/message/sendWhatsAppAudio/${this.instanceName}`;
          payload.audio = media.url;
          break;

        case 'document':
          endpoint = `/message/sendMedia/${this.instanceName}`;
          payload.mediatype = 'document';
          payload.media = media.url;
          payload.fileName = media.filename || 'document';
          payload.caption = media.caption || '';
          break;
      }

      const response = await this.api.post(endpoint, payload);
      logger.info(`Evolution: Mídia ${media.type} enviada para ${to}`);
      return response.data;

    } catch (error) {
      logger.error(`Evolution: Erro ao enviar mídia:`, error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.api.delete(`/instance/logout/${this.instanceName}`);
      logger.info(`Evolution: Instância ${this.instanceName} desconectada`);
    } catch (error) {
      logger.error(`Evolution: Erro ao desconectar:`, error);
      throw error;
    }
  }

  async getQRCode(): Promise<string | null> {
    try {
      const response = await this.api.get(`/instance/connect/${this.instanceName}`);
      return response.data.base64 || response.data.qrcode?.base64 || null;
    } catch (error) {
      logger.error(`Evolution: Erro ao obter QR Code:`, error);
      return null;
    }
  }

  async getStatus(): Promise<WhatsAppStatus> {
    try {
      const response = await this.api.get(`/instance/connectionState/${this.instanceName}`);
      
      const stateMap: Record<string, WhatsAppStatus['status']> = {
        'open': 'CONNECTED',
        'connecting': 'OPENING',
        'close': 'DISCONNECTED'
      };

      return {
        status: stateMap[response.data.state] || 'DISCONNECTED',
        number: response.data.number,
      };
    } catch (error) {
      return { status: 'DISCONNECTED' };
    }
  }

  onMessage(callback: (message: WhatsAppMessage) => void): void {
    this.messageCallback = callback;
  }

  onStatusChange(callback: (status: WhatsAppStatus) => void): void {
    this.statusCallback = callback;
  }

  async checkNumber(number: string): Promise<{ exists: boolean; jid?: string }> {
    try {
      const response = await this.api.post(`/chat/whatsappNumbers/${this.instanceName}`, {
        numbers: [number]
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          exists: result.exists,
          jid: result.jid
        };
      }

      return { exists: false };
    } catch (error) {
      logger.error(`Evolution: Erro ao verificar número:`, error);
      return { exists: false };
    }
  }

  async getProfilePicture(jid: string): Promise<string | null> {
    try {
      const response = await this.api.post(`/chat/fetchProfilePictureUrl/${this.instanceName}`, {
        number: jid.replace('@s.whatsapp.net', '').replace('@g.us', '')
      });

      return response.data.profilePictureUrl || null;
    } catch (error) {
      logger.error(`Evolution: Erro ao obter foto de perfil:`, error);
      return null;
    }
  }

  async markMessageAsRead(messageId: string, remoteJid: string): Promise<void> {
    try {
      await this.api.post(`/chat/markMessageAsRead/${this.instanceName}`, {
        readMessages: [{
          id: messageId,
          fromMe: false,
          remoteJid: remoteJid
        }]
      });
    } catch (error) {
      logger.error(`Evolution: Erro ao marcar como lida:`, error);
    }
  }

  async sendPresence(to: string, type: 'composing' | 'recording' | 'available'): Promise<void> {
    try {
      const presenceMap: Record<string, string> = {
        'composing': 'composing',
        'recording': 'recording',
        'available': 'available'
      };

      await this.api.post(`/chat/updatePresence/${this.instanceName}`, {
        number: to.replace('@s.whatsapp.net', '').replace('@g.us', ''),
        presence: presenceMap[type],
        delay: 1200
      });
    } catch (error) {
      logger.error(`Evolution: Erro ao enviar presence:`, error);
    }
  }

  async getContact(jid: string): Promise<{
    name?: string;
    pushName?: string;
    profilePic?: string;
  }> {
    try {
      const response = await this.api.post(`/chat/fetchProfile/${this.instanceName}`, {
        number: jid.replace('@s.whatsapp.net', '').replace('@g.us', '')
      });

      return {
        name: response.data.name,
        pushName: response.data.name,
        profilePic: response.data.picture
      };
    } catch (error) {
      logger.error(`Evolution: Erro ao obter contato:`, error);
      return {};
    }
  }

  async getGroupInfo(groupJid: string): Promise<{
    subject: string;
    participants: Array<{ id: string; isAdmin: boolean }>;
    owner?: string;
    creation?: number;
  }> {
    try {
      const response = await this.api.get(`/group/fetchAllGroups/${this.instanceName}`);
      
      const group = response.data.find((g: any) => g.id === groupJid);
      
      if (!group) {
        throw new Error('Grupo não encontrado');
      }

      return {
        subject: group.subject,
        participants: group.participants.map((p: any) => ({
          id: p.id,
          isAdmin: p.admin === 'admin' || p.admin === 'superadmin'
        })),
        owner: group.owner,
        creation: group.creation
      };
    } catch (error) {
      logger.error(`Evolution: Erro ao obter info do grupo:`, error);
      throw error;
    }
  }

  /**
   * Processa webhook da Evolution API
   * Deve ser chamado pelo controller de webhooks
   */
  processWebhook(event: string, data: any): void {
    switch (event) {
      case 'QRCODE_UPDATED':
        if (this.statusCallback) {
          this.statusCallback({
            status: 'QRCODE',
            qrcode: data.qrcode.base64
          });
        }
        break;

      case 'CONNECTION_UPDATE':
        if (this.statusCallback) {
          const stateMap: Record<string, WhatsAppStatus['status']> = {
            'open': 'CONNECTED',
            'connecting': 'OPENING',
            'close': 'DISCONNECTED'
          };
          
          this.statusCallback({
            status: stateMap[data.state] || 'DISCONNECTED',
            number: data.number
          });
        }
        break;

      case 'MESSAGES_UPSERT':
        if (this.messageCallback && data.messages) {
          data.messages.forEach((msg: any) => {
            const message: WhatsAppMessage = {
              id: msg.key.id,
              from: msg.key.remoteJid,
              to: msg.key.fromMe ? msg.key.remoteJid : '',
              body: msg.message?.conversation || msg.message?.extendedTextMessage?.text,
              timestamp: msg.messageTimestamp,
              type: this.getMessageType(msg.message),
              isGroup: msg.key.remoteJid?.endsWith('@g.us'),
              participant: msg.key.participant
            };

            this.messageCallback!(message);
          });
        }
        break;
    }
  }

  private getMessageType(message: any): WhatsAppMessage['type'] {
    if (message.conversation || message.extendedTextMessage) return 'text';
    if (message.imageMessage) return 'image';
    if (message.videoMessage) return 'video';
    if (message.audioMessage) return 'audio';
    if (message.documentMessage) return 'document';
    if (message.stickerMessage) return 'sticker';
    if (message.locationMessage) return 'location';
    if (message.contactMessage) return 'contact';
    return 'text';
  }
}
