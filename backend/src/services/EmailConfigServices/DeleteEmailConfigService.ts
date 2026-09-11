import AppError from "../../errors/AppError";
import EmailConfig from "../../models/EmailConfig";

const DeleteEmailConfigService = async (id: number, companyId: number): Promise<void> => {
  const config = await EmailConfig.findOne({ where: { id, companyId } });

  if (!config) throw new AppError("ERR_EMAIL_CONFIG_NOT_FOUND", 404);

  await config.destroy();
};

export default DeleteEmailConfigService;
