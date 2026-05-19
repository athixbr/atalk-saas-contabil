import WhatsappStory from "../../models/WhatsappStory";

const MarkStorySeenService = async (storyId: number, companyId: number): Promise<WhatsappStory> => {
  const story = await WhatsappStory.findOne({ where: { id: storyId, companyId } });

  if (!story) {
    throw new Error("Story não encontrado");
  }

  await story.update({ seenAt: new Date() });

  return story;
};

export default MarkStorySeenService;
