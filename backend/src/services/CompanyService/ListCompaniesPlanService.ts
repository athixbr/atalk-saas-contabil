import fs from "fs";
import path from "path";
import Company from "../../models/Company";
import Plan from "../../models/Plan";

const getFolderSizeBytes = (folderPath: string): number => {
  if (!fs.existsSync(folderPath)) return 0;
  let total = 0;
  for (const entry of fs.readdirSync(folderPath, { withFileTypes: true })) {
    const full = path.join(folderPath, entry.name);
    if (entry.isDirectory()) {
      total += getFolderSizeBytes(full);
    } else {
      try {
        total += fs.statSync(full).size;
      } catch {}
    }
  }
  return total;
};

const ListCompaniesPlanService = async (): Promise<any[]> => {
  const companies = await Company.findAll({
    attributes: ["id", "name", "email", "status", "dueDate", "createdAt", "phone", "document", "lastLogin"],
    order: [["name", "ASC"]],
    include: [
      {
        model: Plan, as: "plan",
        attributes: [
          "id",
          "name",
          "users",
          "connections",
          "queues",
          "amount",
          "useWhatsapp",
          "useFacebook",
          "useInstagram",
          "useCampaigns",
          "useSchedules",
          "useInternalChat",
          "useExternalApi"
        ]
      },
    ]
  });

  const publicFolder = path.resolve(__dirname, "..", "..", "..", "..", "public");

  return companies.map((company) => {
    const companyFolder = path.join(publicFolder, `company${company.id}`);
    const diskBytes = getFolderSizeBytes(companyFolder);
    return { ...(company.toJSON()), diskUsage: diskBytes };
  });
};

export default ListCompaniesPlanService;
