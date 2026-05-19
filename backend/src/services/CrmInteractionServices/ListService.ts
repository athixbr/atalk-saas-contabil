import CrmInteraction from "../../models/CrmInteraction";
import User from "../../models/User";
import CrmLead from "../../models/CrmLead";

interface Request {
  companyId: number;
  leadId?: number | string;
  userId?: number | string;
  type?: string;
}

const ListService = async ({
  companyId,
  leadId,
  userId,
  type
}: Request): Promise<CrmInteraction[]> => {
  const whereCondition: any = { companyId };

  if (leadId) {
    whereCondition.leadId = leadId;
  }

  if (userId) {
    whereCondition.userId = userId;
  }

  if (type) {
    whereCondition.type = type;
  }

  const interactions = await CrmInteraction.findAll({
    where: whereCondition,
    include: [
      { model: User, as: "user", attributes: ["id", "name", "email"] },
      { model: CrmLead, as: "lead", attributes: ["id", "name"] }
    ],
    order: [["date", "DESC"]]
  });

  return interactions;
};

export default ListService;
