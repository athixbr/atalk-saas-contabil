import CrmTaxRegime from "../../models/CrmTaxRegime";
import AppError from "../../errors/AppError";

const ShowService = async (id: string, companyId: number): Promise<CrmTaxRegime> => {
  const taxRegime = await CrmTaxRegime.findOne({
    where: { id, companyId }
  });

  if (!taxRegime) {
    throw new AppError("ERR_NO_CRM_TAX_REGIME_FOUND", 404);
  }

  return taxRegime;
};

export default ShowService;
