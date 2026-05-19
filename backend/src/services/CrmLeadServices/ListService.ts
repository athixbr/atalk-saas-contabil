import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import CrmLead from "../../models/CrmLead";
import Contact from "../../models/Contact";
import User from "../../models/User";
import CrmBusinessType from "../../models/CrmBusinessType";
import CrmTaxRegime from "../../models/CrmTaxRegime";
import CrmSource from "../../models/CrmSource";

interface Request {
  companyId: number;
  userId?: number | string;
  stage?: string;
  status?: string;
  searchParam?: string;
  businessTypeId?: number | string;
  taxRegimeId?: number | string;
  sourceId?: number | string;
}

const ListService = async ({
  companyId,
  userId,
  stage,
  status,
  searchParam,
  businessTypeId,
  taxRegimeId,
  sourceId
}: Request): Promise<CrmLead[]> => {
  const whereCondition: any = { companyId };

  if (userId) {
    whereCondition.userId = userId;
  }

  if (stage) {
    whereCondition.stage = stage;
  }

  if (status) {
    whereCondition.status = status;
  }

  if (businessTypeId) {
    whereCondition.businessTypeId = businessTypeId;
  }

  if (taxRegimeId) {
    whereCondition.taxRegimeId = taxRegimeId;
  }

  if (sourceId) {
    whereCondition.sourceId = sourceId;
  }

  if (searchParam) {
    whereCondition[Op.or] = [
      { name: { [Op.iLike]: `%${searchParam}%` } },
      { phone: { [Op.iLike]: `%${searchParam}%` } },
      { email: { [Op.iLike]: `%${searchParam}%` } }
    ];
  }

  const leads = await CrmLead.findAll({
    where: whereCondition,
    include: [
      { model: Contact, as: "contact" },
      { model: User, as: "user", attributes: ["id", "name", "email"] },
      { model: CrmBusinessType, as: "businessType" },
      { model: CrmTaxRegime, as: "taxRegime" },
      { model: CrmSource, as: "source" }
    ],
    order: [["createdAt", "DESC"]]
  });

  return leads;
};

export default ListService;
