import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmBusinessType from "../../models/CrmBusinessType";

interface Request {
  id: string;
  name?: string;
  description?: string;
  companyId: number;
  active?: boolean;
}

const UpdateService = async ({
  id,
  name,
  description,
  companyId,
  active
}: Request): Promise<CrmBusinessType> => {
  const businessType = await CrmBusinessType.findOne({
    where: { id, companyId }
  });

  if (!businessType) {
    throw new AppError("ERR_NO_CRM_BUSINESS_TYPE_FOUND", 404);
  }

  if (name !== undefined) {
    const schema = Yup.object().shape({
      name: Yup.string().required().min(2)
    });

    try {
      await schema.validate({ name });
    } catch (err: any) {
      throw new AppError(err.message);
    }

    businessType.name = name;
  }

  if (description !== undefined) businessType.description = description;
  if (active !== undefined) businessType.active = active;

  await businessType.save();

  return businessType;
};

export default UpdateService;
