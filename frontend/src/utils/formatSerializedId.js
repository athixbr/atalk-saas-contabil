import { FormatMask } from './FormatMask';

const formatSerializedId = (serializedId, remoteJid) => {
  if (!serializedId) return "Número não disponível";

  // Contatos @lid: sufixo explícito no serializedId
  if (String(serializedId).includes('@lid')) {
    return "Identificador WhatsApp";
  }

  // Contatos @lid: remoteJid explícito passado pelo componente
  if (remoteJid && String(remoteJid).includes('@lid')) {
    return "Identificador WhatsApp";
  }

  // Números LID armazenados como dígitos têm 15-16 chars; telefones reais têm no máximo 13
  // (Brasil: 55 + DDD 2 + número 9 = 13 dígitos)
  const digitsOnly = String(serializedId).replace(/\D/g, '');
  if (digitsOnly.length > 13) {
    return "Identificador WhatsApp";
  }

  const formatMask = new FormatMask();
  const number = serializedId?.replace('@c.us', '');

  return formatMask.setPhoneFormatMask(number);
};

export default formatSerializedId;
