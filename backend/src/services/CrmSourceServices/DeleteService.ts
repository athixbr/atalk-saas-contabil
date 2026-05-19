import CrmSource from "../../models/CrmSource";
import AppError from "../../errors/AppError";

const DeleteService = async (id: string, companyId: number): Promise<void> => {
  const source = await CrmSource.findOne({
    where: { id, companyId }
  });

  if (!source) {
    throw new AppError("ERR_NO_CRM_SOURCE_FOUND", 404);
  }

  await source.destroy();
};

export default DeleteService;
