import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmSource from "../../models/CrmSource";

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
}: Request): Promise<CrmSource> => {
  const source = await CrmSource.findOne({
    where: { id, companyId }
  });

  if (!source) {
    throw new AppError("ERR_NO_CRM_SOURCE_FOUND", 404);
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

    source.name = name;
  }

  if (description !== undefined) source.description = description;
  if (active !== undefined) source.active = active;

  await source.save();

  return source;
};

export default UpdateService;
