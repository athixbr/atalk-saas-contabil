import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmTaxRegime from "../../models/CrmTaxRegime";

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
}: Request): Promise<CrmTaxRegime> => {
  const taxRegime = await CrmTaxRegime.findOne({
    where: { id, companyId }
  });

  if (!taxRegime) {
    throw new AppError("ERR_NO_CRM_TAX_REGIME_FOUND", 404);
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

    taxRegime.name = name;
  }

  if (description !== undefined) taxRegime.description = description;
  if (active !== undefined) taxRegime.active = active;

  await taxRegime.save();

  return taxRegime;
};

export default UpdateService;
