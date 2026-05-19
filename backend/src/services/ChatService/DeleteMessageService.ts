import AppError from "../../errors/AppError";
import ChatMessage from "../../models/ChatMessage";
import { getIO } from "../../libs/socket";

interface Request {
  messageId: number;
  userId: number;
}

const DeleteMessageService = async ({
  messageId,
  userId
}: Request): Promise<void> => {
  const message = await ChatMessage.findByPk(messageId, {
    include: ["chat"]
  });
  
  if (!message) {
    throw new AppError("ERR_NO_CHAT_MESSAGE_FOUND", 404);
  }
  
  // Verifica se o usuário é o dono da mensagem
  if (message.senderId !== userId) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const chatId = message.chatId;
  const companyId = message.chat?.companyId;

  // Deleta a mensagem permanentemente
  await message.destroy();

  const io = getIO();
  io.to(`company-${companyId}-chat-${chatId}`).emit(`company-${companyId}-chat-${chatId}`, {
    action: "delete-message",
    messageId
  });
};

export default DeleteMessageService;
