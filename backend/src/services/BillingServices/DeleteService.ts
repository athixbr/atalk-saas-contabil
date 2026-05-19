import AppError from "../../errors/AppError";
import Billing from "../../models/Billing";

const DeleteService = async (
  id: string | number,
  companyId: number | string
): Promise<void> => {
  const billing = await Billing.findOne({
    where: { id, companyId }
  });

  if (!billing) {
    throw new AppError("ERR_NO_BILLING_FOUND", 404);
  }

  await billing.destroy();
};

export default DeleteService;
