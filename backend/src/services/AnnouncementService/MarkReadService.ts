import AppError from "../../errors/AppError";
import Announcement from "../../models/Announcement";

interface MarkReadData {
  announcementId: number;
  userId: number;
}

const MarkReadService = async (data: MarkReadData): Promise<Announcement> => {
  const { announcementId, userId } = data;

  const announcement = await Announcement.findByPk(announcementId);

  if (!announcement) {
    throw new AppError("Notificação não encontrada", 404);
  }

  // Adicionar usuário à lista readByUsers se ainda não está
  // @ts-ignore
  const readByUsers = announcement.readByUsers || [];
  
  const alreadyRead = readByUsers.some(
    (item: any) => item.userId === userId
  );

  if (!alreadyRead) {
    readByUsers.push({
      userId,
      readAt: new Date()
    });

    await announcement.update({
      readByUsers
    });
    await announcement.reload();
  }

  return announcement;
};

export default MarkReadService;
