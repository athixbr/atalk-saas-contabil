import CrmBusinessType from "../../models/CrmBusinessType";
import AppError from "../../errors/AppError";

const DeleteService = async (id: string, companyId: number): Promise<void> => {
  const businessType = await CrmBusinessType.findOne({
    where: { id, companyId }
  });

  if (!businessType) {
    throw new AppError("ERR_NO_CRM_BUSINESS_TYPE_FOUND", 404);
  }

  await businessType.destroy();
};

export default DeleteService;
