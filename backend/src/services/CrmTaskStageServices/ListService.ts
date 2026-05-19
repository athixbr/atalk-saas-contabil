import CrmTaskStage from "../../models/CrmTaskStage";

interface Request {
  companyId: number | string;
}

const ListService = async ({ companyId }: Request): Promise<CrmTaskStage[]> => {
  const stages = await CrmTaskStage.findAll({
    where: { companyId },
    order: [["order", "ASC"], ["name", "ASC"]]
  });

  return stages;
};

export default ListService;
