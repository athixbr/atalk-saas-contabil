/**
 * Adapter para Baileys 6.5.0 (CommonJS)
 * Wrapper do código atual para manter compatibilidade
 * 
 * Este adapter encapsula a lógica existente do Baileys
 * permitindo que funcione lado a lado com outros providers
 */

import Whatsapp from "../models/Whatsapp";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import { IWhatsAppAdapter, WhatsAppMessage, WhatsAppStatus, SendMessageOptions } from "./IWhatsAppAdapter";
import { logger } from "../utils/logger";
import { getWbot } from "../libs/wbot";

export class BaileysAdapter implements IWhatsAppAdapter {
  readonly providerName = 'baileys';
  
  private whatsapp: Whatsapp;
  private wbot: any;

  async initialize(whatsapp: Whatsapp): Promise<void> {
    this.whatsapp = whatsapp;
    
    try {
      // Usa a lógica existente do initWASocket
      // O código atual já faz toda a inicialização
      logger.info(`BaileysAdapter: Inicializando para whatsapp ${whatsapp.id}`);
      
      // A inicialização real acontece no StartWhatsAppSession.ts
      // Este adapter apenas encapsula as chamadas existentes
      
    } catch (error) {
      logger.error(`BaileysAdapter: Erro ao inicializar:`, error);
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
      // Usa a lógica existente do SendWhatsAppMessage
      const wbot = getWbot(this.whatsapp.id);
      
      const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
      
      const sentMessage = await wbot.sendMessage(jid, {
        text: message,
      }, options?.quotedMsg ? { quoted: options.quotedMsg } : {});

      logger.info(`BaileysAdapter: Mensagem enviada para ${to}`);
      return sentMessage;

    } catch (error) {
      logger.error(`BaileysAdapter: Erro ao enviar mensagem:`, error);
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
      const wbot = getWbot(this.whatsapp.id);
      const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;

      let sentMessage;

      switch (media.type) {
        case 'image':
          sentMessage = await wbot.sendMessage(jid, {
            image: media.url ? { url: media.url } : media.buffer,
            caption: media.caption || '',
            mimetype: media.mimetype || 'image/jpeg'
          });
          break;

        case 'video':
          sentMessage = await wbot.sendMessage(jid, {
            video: media.url ? { url: media.url } : media.buffer,
            caption: media.caption || '',
            mimetype: media.mimetype || 'video/mp4'
          });
          break;

        case 'audio':
          sentMessage = await wbot.sendMessage(jid, {
            audio: media.url ? { url: media.url } : media.buffer,
            mimetype: media.mimetype || 'audio/ogg; codecs=opus',
            ptt: true
          });
          break;

        case 'document':
          sentMessage = await wbot.sendMessage(jid, {
            document: media.url ? { url: media.url } : media.buffer,
            fileName: media.filename || 'document',
            caption: media.caption || '',
            mimetype: media.mimetype || 'application/pdf'
          });
          break;
      }

      logger.info(`BaileysAdapter: Mídia ${media.type} enviada para ${to}`);
      return sentMessage;

    } catch (error) {
      logger.error(`BaileysAdapter: Erro ao enviar mídia:`, error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      const wbot = getWbot(this.whatsapp.id);
      await wbot.logout();
      logger.info(`BaileysAdapter: Desconectado whatsapp ${this.whatsapp.id}`);
    } catch (error) {
      logger.error(`BaileysAdapter: Erro ao desconectar:`, error);
      throw error;
    }
  }

  async getQRCode(): Promise<string | null> {
    try {
      // O QR Code é armazenado no campo qrcode do modelo Whatsapp
      return this.whatsapp.qrcode || null;
    } catch (error) {
      logger.error(`BaileysAdapter: Erro ao obter QR Code:`, error);
      return null;
    }
  }

  async getStatus(): Promise<WhatsAppStatus> {
    try {
      return {
        status: this.whatsapp.status as any,
        number: this.whatsapp.number,
        battery: this.whatsapp.battery,
        plugged: this.whatsapp.plugged
      };
    } catch (error) {
      return { status: 'DISCONNECTED' };
    }
  }

  onMessage(callback: (message: WhatsAppMessage) => void): void {
    // O listener de mensagens já existe no wbotMessageListener.ts
    // Este método é apenas um placeholder para manter a interface consistente
    logger.info(`BaileysAdapter: Callback de mensagem registrado`);
  }

  onStatusChange(callback: (status: WhatsAppStatus) => void): void {
    // O listener de status já existe no wbotMonitor.ts
    // Este método é apenas um placeholder para manter a interface consistente
    logger.info(`BaileysAdapter: Callback de status registrado`);
  }

  async checkNumber(number: string): Promise<{ exists: boolean; jid?: string }> {
    try {
      const wbot = getWbot(this.whatsapp.id);
      
      const [result] = await wbot.onWhatsApp(number);
      
      if (result && result.exists) {
        return {
          exists: true,
          jid: result.jid
        };
      }

      return { exists: false };
    } catch (error) {
      logger.error(`BaileysAdapter: Erro ao verificar número:`, error);
      return { exists: false };
    }
  }

  async getProfilePicture(jid: string): Promise<string | null> {
    try {
      const wbot = getWbot(this.whatsapp.id);
      
      const profilePicUrl = await wbot.profilePictureUrl(jid, 'image');
      return profilePicUrl || null;
    } catch (error) {
      logger.error(`BaileysAdapter: Erro ao obter foto de perfil:`, error);
      return null;
    }
  }

  async markMessageAsRead(messageId: string, remoteJid: string): Promise<void> {
    try {
      const wbot = getWbot(this.whatsapp.id);
      
      await wbot.readMessages([{
        remoteJid,
        id: messageId,
        participant: undefined
      }]);
    } catch (error) {
      logger.error(`BaileysAdapter: Erro ao marcar como lida:`, error);
    }
  }

  async sendPresence(to: string, type: 'composing' | 'recording' | 'available'): Promise<void> {
    try {
      const wbot = getWbot(this.whatsapp.id);
      const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
      
      await wbot.sendPresenceUpdate(type, jid);
    } catch (error) {
      logger.error(`BaileysAdapter: Erro ao enviar presence:`, error);
    }
  }

  async getContact(jid: string): Promise<{
    name?: string;
    pushName?: string;
    profilePic?: string;
  }> {
    try {
      const wbot = getWbot(this.whatsapp.id);
      
      // Tenta obter do store primeiro
      const contact = (wbot as any).store?.contacts[jid];
      
      if (contact) {
        const profilePic = await this.getProfilePicture(jid);
        
        return {
          name: contact.name || contact.notify,
          pushName: contact.notify,
          profilePic
        };
      }

      return {};
    } catch (error) {
      logger.error(`BaileysAdapter: Erro ao obter contato:`, error);
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
      const wbot = getWbot(this.whatsapp.id);
      
      const groupMetadata = await wbot.groupMetadata(groupJid);
      
      return {
        subject: groupMetadata.subject,
        participants: groupMetadata.participants.map((p: any) => ({
          id: p.id,
          isAdmin: p.admin === 'admin' || p.admin === 'superadmin'
        })),
        owner: groupMetadata.owner,
        creation: groupMetadata.creation
      };
    } catch (error) {
      logger.error(`BaileysAdapter: Erro ao obter info do grupo:`, error);
      throw error;
    }
  }
}
