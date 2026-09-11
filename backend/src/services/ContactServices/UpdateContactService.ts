import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import Tag from "../../models/Tag";

interface ExtraInfo {
  id?: number;
  name: string;
  value: string;
}
interface ContactData {
  email?: string;
  number?: string;
  name?: string;
  acceptAudioMessage?: boolean;
  active?: boolean;
  extraInfo?: ExtraInfo[];
  disableBot?: boolean;
  remoteJid?: string;
}

interface Request {
  contactData: ContactData;
  contactId: string;
  companyId: number;
}

const UpdateContactService = async ({
  contactData,
  contactId,
  companyId
}: Request): Promise<Contact> => {
  const { email, name, number, extraInfo, acceptAudioMessage, active, disableBot,remoteJid } = contactData;

  const contact = await Contact.findOne({
    where: { id: contactId },
    attributes: ["id", "name", "number", "email", "companyId", "acceptAudioMessage", "active", "profilePicUrl", "remoteJid"],
    include: ["extraInfo"]
  });

  if (!contact) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  if (contact.companyId !== companyId) {
    throw new AppError("Não é possível alterar registros de outra empresa");
  }

  if (extraInfo) {
    await Promise.all(
      extraInfo.map(async (info: any) => {
        await ContactCustomField.upsert({ ...info, contactId: contact.id });
      })
    );

    await Promise.all(
      contact.extraInfo.map(async oldInfo => {
        const stillExists = extraInfo.findIndex(info => info.id === oldInfo.id);

        if (stillExists === -1) {
          await ContactCustomField.destroy({ where: { id: oldInfo.id } });
        }
      })
    );
  }

  await contact.update({
    name,
    number,
    email,
    acceptAudioMessage,
    active,
    disableBot,
    remoteJid
  });

  await contact.reload({
    attributes: ["id", "name", "number", "email", "acceptAudioMessage", "active", "profilePicUrl", "remoteJid"],
    include: ["extraInfo", { model: Tag, as: "tags" }]
  });

  return contact;
};

export default UpdateContactService;
