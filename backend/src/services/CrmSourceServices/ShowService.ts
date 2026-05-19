import CrmSource from "../../models/CrmSource";
import AppError from "../../errors/AppError";

const ShowService = async (id: string, companyId: number): Promise<CrmSource> => {
  const source = await CrmSource.findOne({
    where: { id, companyId }
  });

  if (!source) {
    throw new AppError("ERR_NO_CRM_SOURCE_FOUND", 404);
  }

  return source;
};

export default ShowService;
