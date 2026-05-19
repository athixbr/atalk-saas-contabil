import CrmClient from "../../models/CrmClient";
import AppError from "../../errors/AppError";

const DeleteService = async (
  id: string | number,
  companyId: number
): Promise<void> => {
  const client = await CrmClient.findOne({
    where: { id, companyId }
  });

  if (!client) {
    throw new AppError("ERR_NO_CLIENT_FOUND", 404);
  }

  await client.destroy();
};

export default DeleteService;
