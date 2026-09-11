import WhatsappStory from "../../models/WhatsappStory";
import AppError from "../../errors/AppError";

const DeleteStoryService = async (storyId: number, companyId: number): Promise<void> => {
  const story = await WhatsappStory.findOne({ where: { id: storyId, companyId } });

  if (!story) {
    throw new AppError("Story não encontrado", 404);
  }

  await story.destroy();
};

export default DeleteStoryService;
