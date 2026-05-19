import CrmTaxRegime from "../../models/CrmTaxRegime";

interface Request {
  companyId: number;
  active?: boolean;
}

const ListService = async ({
  companyId,
  active
}: Request): Promise<CrmTaxRegime[]> => {
  const whereCondition: any = { companyId };

  if (active !== undefined) {
    whereCondition.active = active;
  }

  const taxRegimes = await CrmTaxRegime.findAll({
    where: whereCondition,
    order: [["name", "ASC"]]
  });

  return taxRegimes;
};

export default ListService;
