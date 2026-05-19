import CrmBusinessType from "../../models/CrmBusinessType";
import AppError from "../../errors/AppError";

const ShowService = async (id: string, companyId: number): Promise<CrmBusinessType> => {
  const businessType = await CrmBusinessType.findOne({
    where: { id, companyId }
  });

  if (!businessType) {
    throw new AppError("ERR_NO_CRM_BUSINESS_TYPE_FOUND", 404);
  }

  return businessType;
};

export default ShowService;
