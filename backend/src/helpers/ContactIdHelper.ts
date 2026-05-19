/**
 * Helper para normalizar e comparar IDs de contatos
 * Compatível com @s.whatsapp.net (Baileys 6.5.0) e @lid (Baileys 6.7.8+)
 */

/**
 * Extrai apenas o número de um JID, removendo domínio e formatação
 * @param jid - ID completo (ex: 5511999999999@s.whatsapp.net, 157737589719060@lid, 5511999999999:9@s.whatsapp.net)
 * @returns Número limpo sem formatação
 * 
 * @example
 * normalizeJid("5511999999999@s.whatsapp.net") // "5511999999999"
 * normalizeJid("157737589719060@lid") // "157737589719060"
 * normalizeJid("5511999999999:9@s.whatsapp.net") // "5511999999999"
 */
export function normalizeJid(jid: string): string {
  if (!jid) return "";
  
  return jid
    .split('@')[0]           // Remove @s.whatsapp.net, @lid, @g.us, @c.us
    .split(':')[0]           // Remove :9 (resource identifier)
    .replace(/\D/g, '');     // Remove tudo que não é número
}

/**
 * Compara dois JIDs verificando se são o mesmo contato
 * @param jid1 - Primeiro JID
 * @param jid2 - Segundo JID
 * @returns true se são o mesmo contato
 * 
 * @example
 * compareJids("5511999999999@s.whatsapp.net", "157737589719060@lid") // false
 * compareJids("5511999999999@s.whatsapp.net", "5511999999999:9@s.whatsapp.net") // true
 */
export function compareJids(jid1: string, jid2: string): boolean {
  if (!jid1 || !jid2) return false;
  
  const num1 = normalizeJid(jid1);
  const num2 = normalizeJid(jid2);
  
  return num1 === num2;
}

/**
 * Cria um JID no formato correto para envio de mensagem
 * Suporta ambos os formatos (antigo e novo)
 * @param number - Número sem formatação
 * @param isGroup - Se é um grupo
 * @returns JID formatado
 * 
 * @example
 * createJid("5511999999999", false) // "5511999999999@s.whatsapp.net"
 * createJid("120363423518365631", true) // "120363423518365631@g.us"
 */
export function createJid(number: string, isGroup: boolean = false): string {
  // Se já tem @, retorna como está
  if (number.includes('@')) {
    return number;
  }
  
  // Remove tudo que não é número
  const cleanNumber = number.replace(/\D/g, '');
  
  // Retorna com sufixo correto
  return isGroup ? `${cleanNumber}@g.us` : `${cleanNumber}@s.whatsapp.net`;
}

/**
 * Verifica se um JID é de um grupo
 * @param jid - JID completo
 * @returns true se for grupo
 */
export function isGroupJid(jid: string): boolean {
  return jid?.includes('@g.us') || false;
}

/**
 * Extrai o número de um JID mantendo formatação BR se necessário
 * @param jid - JID completo
 * @returns Número sem @domínio
 */
export function extractNumber(jid: string): string {
  if (!jid) return "";
  return jid.split('@')[0];
}

/**
 * Formata número brasileiro removendo 9º dígito se necessário
 * @param number - Número completo
 * @returns Número formatado
 */
export function formatBRNumber(number: string): string {
  const cleanNumber = number.replace(/\D/g, '');
  const regexp = new RegExp(/^(\d{2})(\d{2})\d{1}(\d{8})$/);
  
  if (regexp.test(cleanNumber)) {
    const match = regexp.exec(cleanNumber);
    if (match && match[1] === '55' && Number.isInteger(Number.parseInt(match[2]))) {
      const ddd = Number.parseInt(match[2]);
      if (ddd < 31) {
        return match[0]; // Mantém com 9
      } else if (ddd >= 31) {
        return match[1] + match[2] + match[3]; // Remove 9
      }
    }
  }
  
  return cleanNumber;
}

/**
 * Busca um participante em uma lista comparando IDs de forma segura
 * @param participantId - ID do participante a buscar
 * @param participants - Lista de participantes
 * @returns Participante encontrado ou undefined
 */
export function findParticipantByJid(
  participantId: string, 
  participants: Array<{ id: string; [key: string]: any }>
): typeof participants[0] | undefined {
  const targetNumber = normalizeJid(participantId);
  
  return participants.find(p => {
    const participantNumber = normalizeJid(p.id);
    return participantNumber === targetNumber;
  });
}
