/**
 * Adapter para Baileys 2026 (ESM Service)
 * Conecta-se ao microserviço ESM que roda o Baileys mais recente
 * Porta: 8081
 */

import axios, { AxiosInstance } from 'axios';
import Whatsapp from "../models/Whatsapp";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import { IWhatsAppAdapter, WhatsAppMessage, WhatsAppStatus, SendMessageOptions } from "./IWhatsAppAdapter";
import { logger } from "../utils/logger";

export class Baileys2026Adapter implements IWhatsAppAdapter {
  readonly providerName = 'baileys2026';
  
  private api: AxiosInstance;
  private whatsapp: Whatsapp;
  private messageCallback?: (message: WhatsAppMessage) => void;
  private statusCallback?: (status: WhatsAppStatus) => void;

  constructor() {
    const serviceUrl = process.env.BAILEYS_2026_URL || 'http://localhost:8081';
    
    this.api = axios.create({
      baseURL: serviceUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async initialize(whatsapp: Whatsapp): Promise<void> {
    this.whatsapp = whatsapp;

    try {
      // URL do webhook para receber eventos
      const webhookUrl = `${process.env.BACKEND_URL}/api/webhooks/baileys2026/${whatsapp.id}`;

      logger.info(`Baileys2026: Iniciando conexão ${whatsapp.id} via microserviço`);

      // Inicia conexão no microserviço
      const response = await this.api.post(`/connection/${whatsapp.id}/start`, {
        webhookUrl
      });

      logger.info(`Baileys2026: Resposta do microserviço:`, response.data);

    } catch (error) {
      logger.error(`Baileys2026: Erro ao inicializar:`, error);
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
      const response = await this.api.post('/message/text', {
        whatsappId: this.whatsapp.id.toString(),
        to,
        text: message
      });

      logger.info(`Baileys2026: Mensagem enviada para ${to}`);
      return response.data;

    } catch (error) {
      logger.error(`Baileys2026: Erro ao enviar mensagem:`, error);
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
      const response = await this.api.post('/message/media', {
        whatsappId: this.whatsapp.id.toString(),
        to,
        type: media.type,
        url: media.url,
        caption: media.caption,
        filename: media.filename
      });

      logger.info(`Baileys2026: Mídia ${media.type} enviada para ${to}`);
      return response.data;

    } catch (error) {
      logger.error(`Baileys2026: Erro ao enviar mídia:`, error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.api.post(`/connection/${this.whatsapp.id}/disconnect`);
      logger.info(`Baileys2026: Desconectado whatsapp ${this.whatsapp.id}`);
    } catch (error) {
      logger.error(`Baileys2026: Erro ao desconectar:`, error);
      throw error;
    }
  }

  async getQRCode(): Promise<string | null> {
    try {
      // O QR Code é recebido via webhook e armazenado no modelo
      return this.whatsapp.qrcode || null;
    } catch (error) {
      logger.error(`Baileys2026: Erro ao obter QR Code:`, error);
      return null;
    }
  }

  async getStatus(): Promise<WhatsAppStatus> {
    try {
      const response = await this.api.get(`/connection/${this.whatsapp.id}/status`);
      
      return {
        status: response.data.status,
        number: this.whatsapp.number
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
      const response = await this.api.post('/check-number', {
        whatsappId: this.whatsapp.id.toString(),
        number
      });

      return {
        exists: response.data.exists,
        jid: response.data.jid
      };
    } catch (error) {
      logger.error(`Baileys2026: Erro ao verificar número:`, error);
      return { exists: false };
    }
  }

  async getProfilePicture(jid: string): Promise<string | null> {
    try {
      // TODO: Implementar endpoint no microserviço
      return null;
    } catch (error) {
      logger.error(`Baileys2026: Erro ao obter foto de perfil:`, error);
      return null;
    }
  }

  async markMessageAsRead(messageId: string, remoteJid: string): Promise<void> {
    try {
      // TODO: Implementar endpoint no microserviço
      logger.info(`Baileys2026: Marcando mensagem como lida`);
    } catch (error) {
      logger.error(`Baileys2026: Erro ao marcar como lida:`, error);
    }
  }

  async sendPresence(to: string, type: 'composing' | 'recording' | 'available'): Promise<void> {
    try {
      // TODO: Implementar endpoint no microserviço
      logger.info(`Baileys2026: Enviando presence ${type} para ${to}`);
    } catch (error) {
      logger.error(`Baileys2026: Erro ao enviar presence:`, error);
    }
  }

  async getContact(jid: string): Promise<{
    name?: string;
    pushName?: string;
    profilePic?: string;
  }> {
    try {
      // TODO: Implementar endpoint no microserviço
      return {};
    } catch (error) {
      logger.error(`Baileys2026: Erro ao obter contato:`, error);
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
      // TODO: Implementar endpoint no microserviço
      throw new Error('Não implementado');
    } catch (error) {
      logger.error(`Baileys2026: Erro ao obter info do grupo:`, error);
      throw error;
    }
  }

  /**
   * Processa webhook do microserviço Baileys 2026
   * Chamado pelo controller de webhooks
   */
  processWebhook(event: string, data: any): void {
    logger.info(`Baileys2026: Webhook recebido - event: ${event}`);

    switch (event) {
      case 'qrcode':
        if (this.statusCallback) {
          this.statusCallback({
            status: 'QRCODE',
            qrcode: data.qrcode
          });
        }
        break;

      case 'status':
        if (this.statusCallback) {
          this.statusCallback({
            status: data.status
          });
        }
        break;

      case 'message':
        if (this.messageCallback) {
          const message: WhatsAppMessage = {
            id: data.id,
            from: data.from,
            to: '',
            body: data.message?.text,
            timestamp: data.timestamp,
            type: data.message?.type || 'text',
            isGroup: data.isGroup,
            participant: data.participant
          };

          this.messageCallback(message);
        }
        break;

      default:
        logger.warn(`Baileys2026: Evento desconhecido: ${event}`);
    }
  }
}
