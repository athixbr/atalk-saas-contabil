import { Op } from "sequelize";
import WhatsappStory from "../../models/WhatsappStory";
import Whatsapp from "../../models/Whatsapp";

interface ListStoriesParams {
  companyId: number;
  whatsappId?: number;
  direction?: "received" | "sent" | "all";
  onlyActive?: boolean; // apenas não expirados
}

export interface StoryWithContact extends WhatsappStory {
  whatsapp: Whatsapp;
}

// Agrupa stories por senderJid retornando apenas o mais recente de cada contato
export interface ContactStoryGroup {
  senderJid: string;
  senderName: string | null;
  senderProfilePic: string | null;
  storiesCount: number;
  hasUnseen: boolean;
  latestStory: WhatsappStory;
  stories: WhatsappStory[];
}

const ListStoriesService = async ({
  companyId,
  whatsappId,
  direction = "received",
  onlyActive = true
}: ListStoriesParams): Promise<ContactStoryGroup[]> => {
  const where: any = { companyId };

  if (whatsappId) {
    where.whatsappId = whatsappId;
  }

  if (direction !== "all") {
    where.direction = direction;
  }

  if (onlyActive) {
    where.expiresAt = { [Op.gt]: new Date() };
  }

  const stories = await WhatsappStory.findAll({
    where,
    include: [{ model: Whatsapp, as: "whatsapp", attributes: ["id", "name"] }],
    order: [["createdAt", "DESC"]]
  });

  // Agrupa por senderJid
  const grouped = new Map<string, WhatsappStory[]>();
  for (const story of stories) {
    const jid = story.senderJid;
    if (!grouped.has(jid)) grouped.set(jid, []);
    grouped.get(jid)!.push(story);
  }

  const result: ContactStoryGroup[] = [];
  grouped.forEach((storyList, senderJid) => {
    const latest = storyList[0];
    result.push({
      senderJid,
      senderName: latest.senderName,
      senderProfilePic: latest.senderProfilePic,
      storiesCount: storyList.length,
      hasUnseen: storyList.some(s => !s.seenAt),
      latestStory: latest,
      stories: storyList
    });
  });

  return result;
};

export default ListStoriesService;
