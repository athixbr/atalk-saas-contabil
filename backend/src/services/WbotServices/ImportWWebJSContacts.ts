/**
 * Serviço para importar contatos do WWebJS
 * Similar ao ImportContactsService.ts mas adaptado para WWebJS
 */

import { getAdapter, hasAdapter } from "../../libs/adapterManager";
import { logger } from "../../utils/logger";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";

/**
 * Extrai o número do ID serializado do WhatsApp
 * Ex: 5511999999999@c.us -> 5511999999999
 */
const formatSerializedId = (id: string): string => {
  if (!id) return '';
  
  // Remove @c.us, @g.us, @s.whatsapp.net, etc
  const cleaned = id.split('@')[0];
  
  // Remove qualquer caractere que não seja número
  const numbers = cleaned.replace(/\D/g, '');
  
  return numbers;
};

interface ImportProgress {
  total: number;
  imported: number;
  errors: number;
}

const ImportWWebJSContacts = async (
  whatsappId: number,
  companyId: number
): Promise<ImportProgress> => {
  logger.info(`ImportWWebJSContacts: Iniciando importação para whatsapp ${whatsappId}`);
  
  const progress: ImportProgress = {
    total: 0,
    imported: 0,
    errors: 0
  };

  try {
    // Verifica se existe adapter para este whatsapp
    if (!hasAdapter(whatsappId)) {
      throw new Error(`Adapter não encontrado para whatsapp ${whatsappId}`);
    }

    const adapter = getAdapter(whatsappId);
    const whatsapp = await Whatsapp.findByPk(whatsappId);

    if (!whatsapp) {
      throw new Error(`WhatsApp ${whatsappId} não encontrado`);
    }

    logger.info(`ImportWWebJSContacts: Obtendo contatos do WhatsApp...`);

    // Obtém todos os contatos via adapter
    const contacts = await adapter.getAllContacts();
    progress.total = contacts.length;

    logger.info(`ImportWWebJSContacts: ${contacts.length} contatos encontrados`);

    // Processa cada contato
    for (const wwebContact of contacts) {
      try {
        // Extrai número do ID (formato: 5511999999999@c.us)
        const number = formatSerializedId(wwebContact.id);
        
        // Pula se não for um número válido
        if (!number || number === 'status' || number.includes('broadcast')) {
          continue;
        }

        // Busca ou cria contato no banco
        const [contact, created] = await Contact.findOrCreate({
          where: {
            number,
            companyId
          },
          defaults: {
            name: wwebContact.name || wwebContact.pushname || number,
            number,
            companyId,
            profilePicUrl: wwebContact.profilePicUrl,
            isGroup: wwebContact.isGroup || false
          }
        });

        // Se já existe, atualiza informações
        if (!created) {
          const updateData: any = {};
          
          if (wwebContact.name && wwebContact.name !== number) {
            updateData.name = wwebContact.name;
          }
          
          if (wwebContact.profilePicUrl) {
            updateData.profilePicUrl = wwebContact.profilePicUrl;
          }

          if (Object.keys(updateData).length > 0) {
            await contact.update(updateData);
          }
        }

        progress.imported++;

        if (progress.imported % 50 === 0) {
          logger.info(`ImportWWebJSContacts: ${progress.imported}/${progress.total} contatos processados`);
        }

      } catch (contactError) {
        logger.error(`ImportWWebJSContacts: Erro ao processar contato:`, contactError);
        progress.errors++;
      }
    }

    logger.info(`ImportWWebJSContacts: Importação concluída`);
    logger.info(`ImportWWebJSContacts: Total: ${progress.total}, Importados: ${progress.imported}, Erros: ${progress.errors}`);

  } catch (error) {
    logger.error(`ImportWWebJSContacts: Erro na importação:`, error);
    throw error;
  }

  return progress;
};

export default ImportWWebJSContacts;
