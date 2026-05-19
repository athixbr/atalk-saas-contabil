/**
 * Interface base para adapters de WhatsApp
 * Permite suportar múltiplos providers (Baileys, Evolution API, etc)
 */

import Whatsapp from "../models/Whatsapp";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";

export interface WhatsAppMessage {
  id: string;
  from: string;
  fromMe?: boolean;
  to: string;
  body?: string;
  timestamp: number;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'location' | 'contact';
  mediaUrl?: string;
  caption?: string;
  quotedMsg?: any;
  isGroup?: boolean;
  participant?: string;
}

export interface WhatsAppStatus {
  status: 'CONNECTED' | 'OPENING' | 'DISCONNECTED' | 'QRCODE' | 'TIMEOUT';
  qrcode?: string;
  number?: string;
  battery?: string;
  plugged?: boolean;
}

export interface SendMessageOptions {
  quotedMsg?: any;
  mentionedJidList?: string[];
  extraInfo?: any;
}

export interface IWhatsAppAdapter {
  /**
   * Nome do provider (baileys, evolution, venom, etc)
   */
  readonly providerName: string;

  /**
   * Inicializa a conexão
   */
  initialize(whatsapp: Whatsapp): Promise<void>;

  /**
   * Envia mensagem de texto
   */
  sendMessage(
    to: string,
    message: string,
    ticket: Ticket,
    options?: SendMessageOptions
  ): Promise<any>;

  /**
   * Envia mídia (imagem, vídeo, documento, etc)
   */
  sendMedia(
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
  ): Promise<any>;

  /**
   * Desconecta a sessão
   */
  disconnect(): Promise<void>;

  /**
   * Obtém QR Code (se disponível)
   */
  getQRCode(): Promise<string | null>;

  /**
   * Obtém status da conexão
   */
  getStatus(): Promise<WhatsAppStatus>;

  /**
   * Registra callback para mensagens recebidas
   */
  onMessage(callback: (message: WhatsAppMessage) => void): void;

  /**
   * Registra callback para mudanças de status
   */
  onStatusChange(callback: (status: WhatsAppStatus) => void): void;

  /**
   * Obtém todos os contatos (para importação)
   * Opcional - nem todos os adapters precisam implementar
   */
  getAllContacts?(): Promise<Array<{
    id: string;
    name?: string;
    pushname?: string;
    profilePicUrl?: string;
    isGroup: boolean;
  }>>;

  /**
   * Obtém todos os chats (para importação)
   * Opcional - nem todos os adapters precisam implementar
   */
  getAllChats?(): Promise<Array<{
    id: string;
    name: string;
    isGroup: boolean;
    unreadCount: number;
    lastMessage?: {
      body: string;
      timestamp: number;
      fromMe: boolean;
    };
  }>>;

  /**
   * Obtém mensagens de um chat (para importação)
   * Opcional - nem todos os adapters precisam implementar
   */
  getChatMessages?(chatId: string, limit?: number): Promise<any[]>;

  /**
   * Verifica se número existe no WhatsApp
   */
  checkNumber(number: string): Promise<{ exists: boolean; jid?: string }>;

  /**
   * Obtém foto de perfil
   */
  getProfilePicture(jid: string): Promise<string | null>;

  /**
   * Marca mensagem como lida
   */
  markMessageAsRead(messageId: string, remoteJid: string): Promise<void>;

  /**
   * Envia presença (typing, recording, etc)
   */
  sendPresence(to: string, type: 'composing' | 'recording' | 'available'): Promise<void>;

  /**
   * Obtém informações de contato
   */
  getContact(jid: string): Promise<{
    name?: string;
    pushName?: string;
    profilePic?: string;
  }>;

  /**
   * Obtém informações de grupo
   */
  getGroupInfo(groupJid: string): Promise<{
    subject: string;
    participants: Array<{ id: string; isAdmin: boolean }>;
    owner?: string;
    creation?: number;
  }>;
}
