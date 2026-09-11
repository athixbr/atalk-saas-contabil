import { FormatMask } from './FormatMask';

/**
 * Substitui @{numero} no texto por um nome legível.
 * Usado para exibir menções de contatos em mensagens de grupo.
 *
 * - contactsMap: objeto { [number]: name } para resolver nomes conhecidos
 * - Números com > 13 dígitos (LID do WhatsApp) são exibidos como "@Contato"
 * - Números com ≤ 13 dígitos são formatados com máscara de telefone
 */
const formatMentions = (text, contactsMap = {}) => {
  if (!text || typeof text !== 'string') return text;

  return text.replace(/@(\d+)/g, (match, digits) => {
    if (contactsMap[digits]) {
      return `@${contactsMap[digits]}`;
    }

    if (digits.length > 13) {
      return '@Contato';
    }

    try {
      const mask = new FormatMask();
      return `@${mask.setPhoneFormatMask(digits)}`;
    } catch {
      return match;
    }
  });
};

export default formatMentions;
