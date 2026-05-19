import Checklist from "../../models/Checklist";
import ChecklistItem from "../../models/ChecklistItem";
import DigitalOceanService from "../DigitalOceanService";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteChecklistService = async ({
  id,
  companyId
}: Request): Promise<void> => {
  const checklist = await Checklist.findOne({
    where: { id, companyId },
    include: [
      {
        model: ChecklistItem,
        as: "itens"
      }
    ]
  });

  if (!checklist) {
    throw new AppError("ERR_CHECKLIST_NOT_FOUND", 404);
  }

  // Deletar arquivos do Digital Ocean
  if (checklist.itens && checklist.itens.length > 0) {
    for (const item of checklist.itens) {
      if (item.arquivoPath) {
        try {
          await DigitalOceanService.delete(item.arquivoPath);
        } catch (error) {
          console.error(`Erro ao deletar arquivo: ${item.arquivoPath}`, error);
        }
      }
    }
  }

  // Deletar checklist (itens serão deletados por CASCADE)
  await checklist.destroy();
};

export default DeleteChecklistService;
