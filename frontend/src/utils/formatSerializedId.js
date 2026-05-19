import { FormatMask } from './FormatMask';

const formatSerializedId = (serializedId) => {
  if (!serializedId) return "Número não disponível";
  
  // Contatos @lid são identificadores internos do WhatsApp sem número real
  if (String(serializedId).includes('@lid')) {
    return "Identificador WhatsApp";
  }
  
  const formatMask = new FormatMask();
  const number = serializedId?.replace('@c.us', '');

  return formatMask.setPhoneFormatMask(number);
};

export default formatSerializedId;
