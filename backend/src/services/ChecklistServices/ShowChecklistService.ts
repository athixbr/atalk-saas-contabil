import Checklist from "../../models/Checklist";
import ChecklistItem from "../../models/ChecklistItem";
import User from "../../models/User";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const ShowChecklistService = async ({
  id,
  companyId
}: Request): Promise<Checklist> => {
  const checklist = await Checklist.findOne({
    where: { id, companyId },
    include: [
      {
        model: ChecklistItem,
        as: "itens",
        separate: true,
        order: [["ordem", "ASC"]]
      },
      {
        model: User,
        as: "creator",
        attributes: ["id", "name", "email"]
      },
      {
        model: User,
        as: "updater",
        attributes: ["id", "name", "email"]
      }
    ]
  });

  if (!checklist) {
    throw new AppError("ERR_CHECKLIST_NOT_FOUND", 404);
  }

  return checklist;
};

export default ShowChecklistService;
