import CrmSource from "../../models/CrmSource";

interface Request {
  companyId: number;
  active?: boolean;
}

const ListService = async ({
  companyId,
  active
}: Request): Promise<CrmSource[]> => {
  const whereCondition: any = { companyId };

  if (active !== undefined) {
    whereCondition.active = active;
  }

  const sources = await CrmSource.findAll({
    where: whereCondition,
    order: [["name", "ASC"]]
  });

  return sources;
};

export default ListService;
