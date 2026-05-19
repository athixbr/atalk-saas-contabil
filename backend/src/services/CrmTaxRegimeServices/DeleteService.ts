import CrmTaxRegime from "../../models/CrmTaxRegime";
import AppError from "../../errors/AppError";

const DeleteService = async (id: string, companyId: number): Promise<void> => {
  const taxRegime = await CrmTaxRegime.findOne({
    where: { id, companyId }
  });

  if (!taxRegime) {
    throw new AppError("ERR_NO_CRM_TAX_REGIME_FOUND", 404);
  }

  await taxRegime.destroy();
};

export default DeleteService;
