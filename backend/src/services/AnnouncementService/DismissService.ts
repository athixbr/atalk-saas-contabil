import AppError from "../../errors/AppError";
import Announcement from "../../models/Announcement";

interface DismissData {
  announcementId: number;
  userId: number;
}

const DismissService = async (data: DismissData): Promise<Announcement> => {
  const { announcementId, userId } = data;

  const announcement = await Announcement.findByPk(announcementId);

  if (!announcement) {
    throw new AppError("Notificação não encontrada", 404);
  }

  // Adicionar usuário à lista dismissedByUsers se ainda não está
  // @ts-ignore
  const dismissedByUsers = announcement.dismissedByUsers || [];
  
  const alreadyDismissed = dismissedByUsers.some(
    (item: any) => item.userId === userId
  );

  if (!alreadyDismissed) {
    dismissedByUsers.push({
      userId,
      dismissedAt: new Date()
    });

    await announcement.update({
      dismissedByUsers
    });
    await announcement.reload();
  }

  return announcement;
};

export default DismissService;
