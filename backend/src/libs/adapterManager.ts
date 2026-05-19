/**
 * Gerenciador de instâncias de adapters WhatsApp
 * Mantém referência às instâncias ativas para envio de mensagens
 */

import { IWhatsAppAdapter } from "../adapters/IWhatsAppAdapter";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";

interface AdapterInstance {
  whatsappId: number;
  adapter: IWhatsAppAdapter;
}

const adapterInstances: AdapterInstance[] = [];

/**
 * Registra uma instância de adapter
 */
export const registerAdapter = (whatsappId: number, adapter: IWhatsAppAdapter): void => {
  logger.info(`AdapterManager: Registrando adapter para whatsapp ${whatsappId}`);
  
  // Remove instância anterior se existir
  const existingIndex = adapterInstances.findIndex(a => a.whatsappId === whatsappId);
  if (existingIndex !== -1) {
    logger.info(`AdapterManager: Substituindo adapter existente para whatsapp ${whatsappId}`);
    adapterInstances.splice(existingIndex, 1);
  }
  
  adapterInstances.push({ whatsappId, adapter });
  logger.info(`AdapterManager: Adapter registrado. Total de adapters ativos: ${adapterInstances.length}`);
};

/**
 * Obtém adapter por ID do whatsapp
 */
export const getAdapter = (whatsappId: number): IWhatsAppAdapter => {
  const instance = adapterInstances.find(a => a.whatsappId === whatsappId);
  
  if (!instance) {
    throw new AppError(`ERR_ADAPTER_NOT_FOUND: Adapter não encontrado para whatsapp ${whatsappId}`);
  }
  
  return instance.adapter;
};

/**
 * Verifica se existe adapter para o whatsapp
 */
export const hasAdapter = (whatsappId: number): boolean => {
  return adapterInstances.some(a => a.whatsappId === whatsappId);
};

/**
 * Remove adapter do registro
 */
export const removeAdapter = (whatsappId: number): void => {
  const index = adapterInstances.findIndex(a => a.whatsappId === whatsappId);
  
  if (index !== -1) {
    logger.info(`AdapterManager: Removendo adapter para whatsapp ${whatsappId}`);
    adapterInstances.splice(index, 1);
  }
};

/**
 * Lista todos os adapters ativos
 */
export const listAdapters = (): AdapterInstance[] => {
  return [...adapterInstances];
};
