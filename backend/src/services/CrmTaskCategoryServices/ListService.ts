import CrmTaskCategory from "../../models/CrmTaskCategory";

interface Request {
  companyId: number;
  active?: boolean;
  type?: string;
}

const ListService = async ({
  companyId,
  active,
  type
}: Request): Promise<CrmTaskCategory[]> => {
  const whereCondition: any = { companyId };

  if (active !== undefined) {
    whereCondition.active = active;
  }

  if (type) {
    whereCondition.type = type;
  }

  const categories = await CrmTaskCategory.findAll({
    where: whereCondition,
    order: [["name", "ASC"]]
  });

  return categories;
};

export default ListService;
