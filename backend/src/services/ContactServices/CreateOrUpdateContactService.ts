import { getIO } from "../../libs/socket";
import CompaniesSettings from "../../models/CompaniesSettings";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import fs from "fs";
import path, { join } from "path";
import { logger } from "../../utils/logger";
const axios = require('axios');

interface ExtraInfo extends ContactCustomField {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  isGroup: boolean;
  email?: string;
  profilePicUrl?: string;
  companyId: number;
  channel?: string;
  extraInfo?: ExtraInfo[];
  remoteJid?: string;
}

/** Mutex por número/remoteJid para evitar criação duplicada de contatos */
const _contactCreationLocks = new Map<string, Promise<Contact>>();

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  profilePicUrl,
  isGroup,
  email = "",
  channel = "whatsapp",
  companyId,
  extraInfo = [],
  remoteJid = ""
}: Request): Promise<Contact> => {
  let contact: Contact | null = null;
  try {

    const publicFolder = path.resolve(__dirname, "..", "..", "..", "..", "public");

    const number = isGroup ? rawNumber : rawNumber.replace(/[^0-9]/g, "");
    
    const io = getIO();

    contact = await Contact.findOne({
      where: {
        number,
        companyId
      }
    });

    // Se não achou pelo número, tenta pelo remoteJid
    // Cobre: grupos com formato de ID mudado no Baileys v7,
    // e contatos cujo JID mudou de @s.whatsapp.net para @lid ou vice-versa
    if (!contact && remoteJid) {
      contact = await Contact.findOne({
        where: {
          remoteJid,
          companyId
        }
      });
      // Se achou pelo remoteJid, atualiza o número para o novo formato
      if (contact) {
        contact.number = number;
      }
    }

    // Calcula após buscar o contato para comparação correta
    const updateImage = (contact?.profilePicUrl || "") !== profilePicUrl;

    if (contact) {
      contact.remoteJid = remoteJid; 
      contact.profilePicUrl = profilePicUrl || null;

      if (isGroup || contact.name === number) {
        contact.name = name;
      }
      contact.save();
      contact.reload();

      io.emit(`company-${companyId}-contact`, {
        action: "update",
        contact
      });
    } else {
      // Mutex para evitar race condition ao criar contato
      // (dois eventos simultâneos para o mesmo número criariam duplicatas)
      const lockKey = `contact:${companyId}:${remoteJid || number}`;
      const pendingCreate = _contactCreationLocks.get(lockKey);
      if (pendingCreate) {
        logger.debug(`[CreateOrUpdateContact] Aguardando lock de criação para ${lockKey}`);
        contact = await pendingCreate;
      } else {
        const createPromise = (async () => {
          // Re-verifica após obter o lock — outro processo pode ter criado
          const recheck = await Contact.findOne({
            where: remoteJid
              ? { remoteJid, companyId }
              : { number, companyId }
          });
          if (recheck) {
            logger.info(`[CreateOrUpdateContact] Contato ${recheck.id} criado por processo concorrente para ${number || remoteJid}`);
            return recheck;
          }

          const settings = await CompaniesSettings.findOne({where:{companyId}});
          const { acceptAudioMessageContact } = settings || {} as any;

          const created = await Contact.create({
            name,
            number,
            email,
            isGroup,
            extraInfo,
            companyId,
            channel,
            acceptAudioMessage: acceptAudioMessageContact === 'enabled' ? true : false,
            remoteJid,
            urlPicture: profilePicUrl
          });

          io.emit(`company-${companyId}-contact`, {
            action: "create",
            contact: created
          });
          return created;
        })().finally(() => _contactCreationLocks.delete(lockKey));

        _contactCreationLocks.set(lockKey, createPromise);
        contact = await createPromise;
      }
    }

    const folder =  path.resolve(publicFolder , `company${companyId}`,"contacts") 
    
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder,  { recursive: true });
      fs.chmodSync(folder, 0o777)
    }

    if (updateImage ) {
      let filename
      if (profilePicUrl.includes("nopicture")) {
        filename = "nopicture.png";
      }
      else {
      const response = await axios.get(profilePicUrl, {
        responseType: 'arraybuffer'
      });

      filename = `${contact.id}.jpeg`;
      
      // Salvar a imagem no diretório
      fs.writeFileSync(join(folder,filename), response.data);
      
      }
      contact.update({
        urlPicture: filename,
        pictureUpdated: true
      })

      io.emit(`company-${companyId}-contact`, {
        action: "update",
        contact
      });
    }
    return contact;
  } catch (err) {
    logger.error("Error to find or create a contact:", err);
    return contact ?? null;
  }
};

export default CreateOrUpdateContactService;
