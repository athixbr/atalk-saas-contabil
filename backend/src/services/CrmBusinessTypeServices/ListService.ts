import CrmBusinessType from "../../models/CrmBusinessType";

interface Request {
  companyId: number;
  active?: boolean;
}

const ListService = async ({
  companyId,
  active
}: Request): Promise<CrmBusinessType[]> => {
  const whereCondition: any = { companyId };

  if (active !== undefined) {
    whereCondition.active = active;
  }

  const businessTypes = await CrmBusinessType.findAll({
    where: whereCondition,
    order: [["name", "ASC"]]
  });

  return businessTypes;
};

export default ListService;
