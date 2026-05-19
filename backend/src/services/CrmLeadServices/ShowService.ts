import CrmLead from "../../models/CrmLead";
import Contact from "../../models/Contact";
import User from "../../models/User";
import CrmBusinessType from "../../models/CrmBusinessType";
import CrmTaxRegime from "../../models/CrmTaxRegime";
import CrmSource from "../../models/CrmSource";
import CrmTask from "../../models/CrmTask";
import CrmInteraction from "../../models/CrmInteraction";
import AppError from "../../errors/AppError";

const ShowService = async (id: string, companyId: number): Promise<CrmLead> => {
  const lead = await CrmLead.findOne({
    where: { id, companyId },
    include: [
      { model: Contact, as: "contact" },
      { model: User, as: "user", attributes: ["id", "name", "email"] },
      { model: CrmBusinessType, as: "businessType" },
      { model: CrmTaxRegime, as: "taxRegime" },
      { model: CrmSource, as: "source" },
      { 
        model: CrmTask, 
        as: "tasks",
        include: [
          { model: User, as: "user", attributes: ["id", "name"] }
        ]
      },
      { 
        model: CrmInteraction, 
        as: "interactions",
        include: [
          { model: User, as: "user", attributes: ["id", "name"] }
        ],
        order: [["date", "DESC"]]
      }
    ]
  });

  if (!lead) {
    throw new AppError("ERR_NO_CRM_LEAD_FOUND", 404);
  }

  return lead;
};

export default ShowService;
