/**
 * Factory para criar adapters de WhatsApp baseado no provider
 * Suporta: Baileys (atual), Evolution API, e futuros providers
 */

import Whatsapp from "../models/Whatsapp";
import { IWhatsAppAdapter } from "./IWhatsAppAdapter";
import { BaileysAdapter } from "./BaileysAdapter";
import { EvolutionAdapter } from "./EvolutionAdapter";
import { Baileys2026Adapter } from "./Baileys2026Adapter";
import { WWebJSAdapter } from "./WWebJSAdapter";
import { logger } from "../utils/logger";

export class AdapterFactory {
  /**
   * Cria o adapter apropriado baseado no provider do Whatsapp
   */
  static create(whatsapp: Whatsapp): IWhatsAppAdapter {
    const provider = whatsapp.provider || 'baileys';
    
    logger.info(`AdapterFactory: Criando adapter para provider: ${provider}`);

    switch (provider.toLowerCase()) {
      case 'baileys':
      case 'stable':
        return new BaileysAdapter();

      case 'baileys2026':
      case 'whatsapp2026':
        return new Baileys2026Adapter();

      case 'evolution':
        const evolutionUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
        const evolutionKey = process.env.EVOLUTION_API_KEY || '';
        
        if (!evolutionKey) {
          logger.warn('EVOLUTION_API_KEY não configurado no .env, usando valor padrão');
        }
        
        return new EvolutionAdapter(evolutionUrl, evolutionKey);

      case 'wwebjs':
      case 'whatsapp-web':
        return new WWebJSAdapter();

      // Futuros providers podem ser adicionados aqui:
      // case 'venom':
      //   return new VenomAdapter();
      // case 'wppconnect':
      //   return new WPPConnectAdapter();
      // case 'official':
      //   return new WhatsAppOfficialAdapter();

      default:
        logger.warn(`Provider desconhecido: ${provider}, usando Baileys como fallback`);
        return new BaileysAdapter();
    }
  }

  /**
   * Verifica se um provider está disponível
   */
  static isProviderAvailable(provider: string): boolean {
    const availableProviders = ['baileys', 'stable', 'baileys2026', 'whatsapp2026', 'evolution', 'wwebjs', 'whatsapp-web'];
    return availableProviders.includes(provider.toLowerCase());
  }

  /**
   * Lista todos os providers disponíveis
   */
  static getAvailableProviders(): Array<{
    id: string;
    name: string;
    description: string;
    requiresSetup: boolean;
  }> {
    return [
      {
        id: 'baileys',
        name: 'Baileys (Atual)',
        description: 'WhatsApp Web Multi-Device - Versão 6.5.0',
        requiresSetup: false
      },
      {
        id: 'wwebjs',
        name: 'WhatsApp Web.js 🆕',
        description: 'Mais estável - Ideal para clientes VIP - Suporta grupos e todas as features',
        requiresSetup: false
      },
      {
        id: 'baileys2026',
        name: 'WhatsApp 2026',
        description: 'Baileys mais recente (ESM) - Alta performance',
        requiresSetup: true
      },
      {
        id: 'evolution',
        name: 'Evolution API',
        description: 'REST API baseada em Baileys - Multi-instância',
        requiresSetup: true
      }
    ];
  }

  /**
   * Valida configuração do provider
   */
  static validateProviderConfig(provider: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    switch (provider.toLowerCase()) {
      case 'baileys':
      case 'stable':
        // Baileys não precisa de configuração extra
        break;

      case 'wwebjs':
      case 'whatsapp-web':
        // WWebJS não precisa de configuração extra
        // Usa LocalAuth automaticamente
        break;

      case 'baileys2026':
      case 'whatsapp2026':
        if (!process.env.BAILEYS_2026_URL) {
          errors.push('BAILEYS_2026_URL não configurado no .env (ex: http://localhost:8081)');
        }
        break;

      case 'evolution':
        if (!process.env.EVOLUTION_API_URL) {
          errors.push('EVOLUTION_API_URL não configurado no .env');
        }
        if (!process.env.EVOLUTION_API_KEY) {
          errors.push('EVOLUTION_API_KEY não configurado no .env');
        }
        break;

      default:
        errors.push(`Provider desconhecido: ${provider}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
