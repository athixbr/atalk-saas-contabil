import CrmStage from "../../models/CrmStage";

interface Request {
  companyId: number;
  active?: boolean;
}

const ListService = async ({
  companyId,
  active
}: Request): Promise<CrmStage[]> => {
  const whereCondition: any = { companyId };

  if (active !== undefined) {
    whereCondition.active = active;
  }

  const stages = await CrmStage.findAll({
    where: whereCondition,
    order: [["order", "ASC"]]
  });

  return stages;
};

export default ListService;
