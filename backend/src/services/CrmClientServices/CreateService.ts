import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmClient from "../../models/CrmClient";

interface Request {
  name: string;
  companyName?: string;
  cnpj?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  businessTypeId?: number;
  taxRegimeId?: number;
  userId?: number;
  status?: string;
  notes?: string;
  companyId: number | string;
}

const CreateService = async ({
  name,
  companyName,
  cnpj,
  phone,
  whatsapp,
  email,
  street,
  number,
  complement,
  neighborhood,
  city,
  state,
  zipCode,
  businessTypeId,
  taxRegimeId,
  userId,
  status,
  notes,
  companyId
}: Request): Promise<CrmClient> => {
  const schema = Yup.object().shape({
    name: Yup.string().required("Nome é obrigatório").min(3, "Nome deve ter no mínimo 3 caracteres")
  });

  try {
    await schema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const client = await CrmClient.create({
    name,
    companyName,
    cnpj,
    phone,
    whatsapp,
    email,
    street,
    number,
    complement,
    neighborhood,
    city,
    state,
    zipCode,
    businessTypeId,
    taxRegimeId,
    userId,
    status: status || "active",
    notes,
    companyId: parseInt(companyId.toString())
  });

  await client.reload({
    include: ["user", "businessType", "taxRegime"]
  });

  return client;
};

export default CreateService;
